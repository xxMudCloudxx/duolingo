import { cache } from "react";
import db from "./drizzle";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import {
  audioCache,
  challengeProgress,
  courses,
  lessons,
  units,
  userProgress,
  userSubscription,
} from "./schema";
import { courseTitleToLangCode } from "@/constants";

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

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });
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
            (progress) => progress.completed === false
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
    (challenge) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
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

  return data;
});

// 查询音频缓存
export const getAudioCache = async (text: string, languageCode: string) => {
  const data = await db.query.audioCache.findFirst({
    where: and(
      eq(audioCache.text, text),
      eq(audioCache.languageCode, languageCode)
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
