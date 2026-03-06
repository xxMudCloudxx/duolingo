"use server";

import { CHALLENGE_POINTS } from "@/constants";
import db from "@/db/drizzle";
import {
  getDailyProgress,
  getQuests,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";
import {
  challengeProgress,
  challenges,
  userDailyQuests,
  userProgress,
} from "@/db/schema";
import { redis, cacheKeys } from "@/lib/redis";
import { getSecondsUntilNext5AM, getTodayDateString } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * 更新用户挑战进度、分数和任务状态
 * - 正确区分【正常模式】和【练习模式】
 * - 正常模式下，使用 Redis 跟踪"今日分数"并检查任务进度
 * - 练习模式下，只更新总分和红心，不影响每日任务
 */
export const upsertChallengeProgress = async (
  challengeId: number,
  timezone: string,
) => {
  try {
    return await _upsertChallengeProgressImpl(challengeId, timezone);
  } catch (error) {
    console.error("[upsertChallengeProgress] ERROR:", error);
    throw error;
  }
};

const _upsertChallengeProgressImpl = async (
  challengeId: number,
  timezone: string,
) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!timezone) {
    console.warn("Timezone not provided by client, falling back to UTC.");
    timezone = "Etc/UTC"; // 提供一个默认值
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("challenge not found");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (
    currentUserProgress.hearts === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  ) {
    return { error: "hearts" };
  }

  // 练习模式
  if (isPractice) {
    // 将练习挑战标记为完成
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    // 更新红心（原子操作，capped at 5）
    await db
      .update(userProgress)
      .set({
        hearts: sql`LEAST(${userProgress.hearts} + 1, 5)`,
      })
      .where(eq(userProgress.userId, userId));

    // 清除 user_progress 的缓存
    try {
      await redis.del(cacheKeys.userProgress(userId));
    } catch (e) {
      console.error("Redis DEL Error (user_progress):", e);
    }

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);

    return;
  }

  // === 正常模式 ===

  // 使用用户时区生成日期键，确保与 quest 系统使用相同的日期
  const ttlInSeconds = getSecondsUntilNext5AM(timezone);
  const dateStr = getTodayDateString(timezone);
  const dailyProgressKey = cacheKeys.dailyProgress(userId, dateStr);
  let currentDailyPoints = 0;

  // 先更新 Redis 每日计数器（原子操作，即使后续 DB 事务失败也可接受轻微超计）
  try {
    const newDailyPoints = await redis.incrby(
      dailyProgressKey,
      CHALLENGE_POINTS,
    );
    await redis.expire(dailyProgressKey, ttlInSeconds);
    currentDailyPoints = newDailyPoints;
  } catch (e) {
    console.error("Redis INCRBY Error (daily_progress):", e);
    // 如果 Redis 失败，从数据库读取旧的每日进度
    const dailyProgress = await getDailyProgress(timezone);
    currentDailyPoints = (dailyProgress?.points || 0) + CHALLENGE_POINTS;
  }

  // 预先计算需要完成的任务和奖励积分
  const dailyQuests = await getQuests(timezone);

  const nowTz = toZonedTime(new Date(), timezone);
  const startInTz = new Date(nowTz.getTime());
  startInTz.setHours(5, 0, 0, 0);
  if (nowTz.getTime() < startInTz.getTime())
    startInTz.setDate(startInTz.getDate() - 1);
  const startUTC = fromZonedTime(startInTz, timezone);

  // 找出所有需要标记完成的 quest entries
  const questEntriesToComplete: { entryId: number; questValue: number }[] = [];

  for (const quest of dailyQuests) {
    if (!quest.completed && currentDailyPoints >= quest.value) {
      const questEntry = await db.query.userDailyQuests.findFirst({
        where: and(
          eq(userDailyQuests.userId, userId),
          eq(userDailyQuests.questId, quest.id),
          eq(userDailyQuests.completed, false),
          sql`${userDailyQuests.assignedAt} >= ${startUTC}`,
        ),
      });

      if (questEntry) {
        questEntriesToComplete.push({
          entryId: questEntry.id,
          questValue: quest.value,
        });
      }
    }
  }

  let totalPointsToAward = CHALLENGE_POINTS;
  for (const entry of questEntriesToComplete) {
    totalPointsToAward += entry.questValue;
  }

  // neon-http 驱动不支持 db.transaction()，按顺序执行写操作
  // 积分更新使用原子 SQL（points + N），即使部分失败也不会出现双花

  // 1. 插入挑战完成记录
  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
  });

  // 2. 标记已完成的每日任务
  for (const entry of questEntriesToComplete) {
    await db
      .update(userDailyQuests)
      .set({ completed: true })
      .where(eq(userDailyQuests.id, entry.entryId));
  }

  // 3. 更新用户积分（原子 SQL 加法，防止并发覆盖）
  await db
    .update(userProgress)
    .set({
      points: sql`${userProgress.points} + ${totalPointsToAward}`,
    })
    .where(eq(userProgress.userId, userId));

  // 事务成功后清除缓存
  try {
    await redis.del(cacheKeys.userProgress(userId));
  } catch (e) {
    console.error("Redis DEL Error (user_progress):", e);
  }

  try {
    await redis.del(cacheKeys.leaderboard());
  } catch (e) {
    console.error("Redis DEL Error (leaderboard):", e);
  }

  try {
    await redis.del(cacheKeys.quests(userId, dateStr));
  } catch (e) {
    console.error("Redis DEL Error (quests):", e);
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
