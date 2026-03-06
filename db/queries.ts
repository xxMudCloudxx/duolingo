import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import {
  audioCache,
  challengeProgress,
  courses,
  lessons,
  quests,
  units,
  userDailyQuests,
  userProgress,
  userSubscription,
} from "./schema";
import { courseTitleToLangCode } from "@/constants";
import { redis, cacheKeys } from "@/lib/redis";
import { getSecondsUntilNext5AM, getTodayDateString } from "@/lib/utils";
import { format, toZonedTime, fromZonedTime } from "date-fns-tz";

export const getUnits = cache(async () => {
  const userProgress = await getUserProgress();
  const { userId } = await auth();

  if (!userProgress?.activeCourseId || !userId) {
    return [];
  }

  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    columns: {
      id: true,
      title: true,
      description: true,
      order: true,
    },
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        columns: {
          id: true,
          title: true,
          order: true,
          unitId: true,
        },
        with: {
          challenges: {
            columns: { id: true },
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }
      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
});

export const getUserProgress = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const cacheKey = cacheKeys.userProgress(userId);

  try {
    const cachedProgress = await redis.get(cacheKey);
    if (cachedProgress) {
      const data = JSON.parse(cachedProgress) as
        | (typeof userProgress.$inferSelect & {
            activeCourse: typeof courses.$inferSelect;
          })
        | undefined;
      return data;
    }
  } catch (e) {
    console.error("Redis GET Error (getUserProgress):", e);
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  // 仅在有数据时缓存，避免缓存 undefined 导致 JSON.parse 异常
  if (data) {
    try {
      // NX: 仅当 key 不存在时才写入，防止并发请求用旧数据覆盖新数据
      await redis.set(cacheKey, JSON.stringify(data), "EX", 600, "NX");
    } catch (e) {
      console.error("Redis SET Error (getUserProgress):", e);
    }
  }

  return data;
});

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();

  return data;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some(
            (progress) => progress.completed === false,
          )
        );
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();
  const courseProgress = await getCourseProgress();

  const lessonId = id || courseProgress?.activeLessonId;

  if (!userId || !lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
          challengeOptions: true,
        },
      },
      unit: {
        with: {
          course: {
            columns: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed,
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100,
  );

  return percentage;
});

export const getUserSubscription = cache(async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
  });

  if (!data) return null;

  // Check if subscription is active
  const isActive =
    data.subscriptionType === "LIFETIME" ||
    (data.expiresAt && data.expiresAt.getTime() > Date.now());

  return {
    ...data,
    isActive: !!isActive,
  };
});

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const cacheKey = cacheKeys.leaderboard();

  // 优先从 Redis 缓存中获取排行榜数据
  try {
    const cachedLeaderboard = await redis.get(cacheKey);
    if (cachedLeaderboard) {
      // 如果命中缓存，直接解析并返回数据
      const data = JSON.parse(cachedLeaderboard);
      return data as {
        userId: string;
        userName: string;
        userImgSrc: string;
        points: number;
      }[];
    }
  } catch (error) {
    console.error("Redis GET error (leaderboard):", error);
    // 如果 Redis 出错，降级处理，继续从数据库查询
  }

  // 如果缓存未命中，则从数据库查询
  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImgSrc: true,
      points: true,
    },
  });

  // 将从数据库获取的结果存入 Redis 缓存，并设置过期时间
  try {
    const ttl = 60 * 10;
    // NX: 仅当 key 不存在时才写入，防止并发请求用旧数据覆盖新数据
    await redis.set(cacheKey, JSON.stringify(data), "EX", ttl, "NX");
  } catch (error) {
    console.error("Redis SET error (leaderboard):", error);
  }

  return data;
});

// 查询音频缓存
export const getAudioCache = async (text: string, languageCode: string) => {
  const data = await db.query.audioCache.findFirst({
    where: and(
      eq(audioCache.text, text),
      eq(audioCache.languageCode, languageCode),
    ),
  });
  return data;
};

/**
 * 根据 lessonId 查询其所属课程的语言代码
 * @param lessonId - 课程 ID
 * @returns 返回语言代码 (例如 "cn", "es") 或 null
 */
export const getLanguageCodeByLessonId = async (lessonId: number) => {
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: {
        with: {
          course: {
            columns: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!data?.unit?.course?.title) {
    console.warn(`无法找到 lessonId: ${lessonId} 对应的课程语言。`);
    return null;
  }

  const courseTitle = data.unit.course.title;
  const langCode = courseTitleToLangCode[courseTitle];

  if (!langCode) {
    console.warn(`课程 "${courseTitle}" 没有对应的语言代码映射。`);
    return null;
  }

  return langCode;
};

export const getQuests = cache(async (timeZone: string) => {
  const { userId } = await auth();
  if (!userId) return [];

  // 如果客户端未能提供时区，则使用一个安全的默认值
  if (!timeZone) {
    console.warn("getQuests: Timezone not provided, falling back to UTC.");
    timeZone = "Etc/UTC";
  }

  const dateStr = format(toZonedTime(new Date(), timeZone), "yyyy-MM-dd");
  const cacheKey = cacheKeys.quests(userId, dateStr);

  // 从Redis读取
  try {
    const cachedQuests = await redis.get(cacheKey);
    if (cachedQuests) {
      const questsData = JSON.parse(cachedQuests);
      questsData.sort(
        (a: { value: number }, b: { value: number }) => a.value - b.value,
      );
      return questsData as (typeof quests.$inferSelect & {
        completed: boolean;
      })[];
    }
  } catch (e) {
    console.error("Redis GET Error:", e);
  }

  // 未命中，查询数据库
  const now = new Date();
  const nowInUserTz = toZonedTime(now, timeZone);

  const startOfDayInUserTz = new Date(nowInUserTz.getTime());
  startOfDayInUserTz.setHours(5, 0, 0, 0);

  // 如果当前时间早于今天的凌晨5点，说明“今天”的任务是从“昨天”的凌晨5点开始的
  if (nowInUserTz.getTime() < startOfDayInUserTz.getTime()) {
    startOfDayInUserTz.setDate(startOfDayInUserTz.getDate() - 1);
  }

  // 将用户时区的“今日起始时间”转换为 UTC 时间，以便与数据库中的 UTC 时间戳进行比较
  const startOfDayUTC = fromZonedTime(startOfDayInUserTz, timeZone);

  const dbQuests = await db.query.userDailyQuests.findMany({
    where: and(
      eq(userDailyQuests.userId, userId),
      sql`${userDailyQuests.assignedAt} >= ${startOfDayUTC}`,
    ),
    with: { quest: true },
  });

  let questsToReturn = [];
  if (dbQuests.length > 0) {
    questsToReturn = dbQuests.map((dq) => ({
      ...dq.quest,
      completed: dq.completed,
    }));
  } else {
    // 数据库没有，则创建任务
    const allQuests = await db.query.quests.findMany();

    // const selectedQuests = allQuests
    //   .sort(() => 0.5 - Math.random())
    //   .slice(0, 3);
    const selectedQuests = allQuests; // TODO: 目前任务少，先返回所有

    // 将挑选出的任务插入到 user_daily_quests 表中
    // onConflictDoNothing: 防止并发请求重复插入（唯一约束 userId+questId+assignedDate）
    if (selectedQuests.length > 0) {
      await db
        .insert(userDailyQuests)
        .values(
          selectedQuests.map((quest) => ({
            userId,
            questId: quest.id,
          })),
        )
        .onConflictDoNothing();
    }
    questsToReturn = selectedQuests.map((q) => ({ ...q, completed: false }));
  }

  questsToReturn.sort((a, b) => a.value - b.value);

  try {
    const ttlInSeconds = getSecondsUntilNext5AM(timeZone);
    await redis.set(
      cacheKey,
      JSON.stringify(questsToReturn),
      "EX",
      ttlInSeconds,
    );
  } catch (e) {
    console.error("Redis SET Error:", e);
  }

  return questsToReturn;
});

/**
 * 从 Redis 获取用户今日获得的分数
 * @param timeZone - 可选，用户时区。传入时使用时区日期作为 key，与 quest 系统一致
 */
export const getDailyProgress = cache(async (timeZone?: string) => {
  const { userId } = await auth();
  if (!userId) return null;

  const dateStr = getTodayDateString(timeZone);
  const dailyProgressKey = cacheKeys.dailyProgress(userId, dateStr);

  try {
    const dailyPoints = await redis.get(dailyProgressKey);
    // 如果键不存在或获取失败，`dailyPoints` 会是 null, Number(null) 结果为 0
    return { points: Number(dailyPoints) || 0 };
  } catch (e) {
    console.error("Redis GET Error (getDailyProgress):", e);
    return { points: 0 }; // 在出错时返回一个安全的默认值
  }
});
