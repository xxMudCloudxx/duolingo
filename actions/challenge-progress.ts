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
import { redis } from "@/lib/redis";
import { getSecondsUntilNext5AM } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { format, toZonedTime } from "date-fns-tz";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * 更新用户挑战进度、分数和任务状态
 * - 正确区分【正常模式】和【练习模式】
 * - 正常模式下，使用 Redis 跟踪“今日分数”并检查任务进度
 * - 练习模式下，只更新总分和红心，不影响每日任务
 */
export const upsertChallengeProgress = async (
  challengeId: number,
  timezone: string
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
      eq(challengeProgress.challengeId, challengeId)
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

    // 更新分数和红心
    await db
      .update(userProgress)
      .set({
        hearts: Math.min(currentUserProgress.hearts + 1, 5), // 练习会奖励红心
        points: currentUserProgress.points + CHALLENGE_POINTS,
      })
      .where(eq(userProgress.userId, userId));

    // 清除 user_progress 的缓存
    try {
      await redis.del(`user_progress:${userId}`);
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

  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
  });

  const ttlInSeconds = getSecondsUntilNext5AM(timezone);
  const dateStr = format(toZonedTime(new Date(), timezone), "yyyy-MM-dd");
  const dailyProgressKey = `daily_progress:${userId}:${dateStr}`;
  let currentDailyPoints = 0;

  try {
    const newDailyPoints = await redis.incrby(
      dailyProgressKey,
      CHALLENGE_POINTS
    );
    await redis.expire(dailyProgressKey, ttlInSeconds);
    currentDailyPoints = newDailyPoints;
  } catch (e) {
    console.error("Redis INCRBY Error (daily_progress):", e);
    // 优雅降级：如果 Redis 失败，从数据库读取旧的每日进度
    const dailyProgress = await getDailyProgress();
    currentDailyPoints = (dailyProgress?.points || 0) + CHALLENGE_POINTS;
  }

  let totalPointsToAward = CHALLENGE_POINTS;

  const dailyQuests = await getQuests(timezone);

  for (const quest of dailyQuests) {
    if (!quest.completed && currentDailyPoints >= quest.value) {
      const questEntry = await db.query.userDailyQuests.findFirst({
        where: and(
          eq(userDailyQuests.userId, userId),
          eq(userDailyQuests.questId, quest.id),
          eq(userDailyQuests.completed, false)
        ),
      });

      if (questEntry) {
        totalPointsToAward += quest.value;

        await db
          .update(userDailyQuests)
          .set({ completed: true })
          .where(eq(userDailyQuests.id, questEntry.id));
      }
    }
  }

  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + totalPointsToAward,
    })
    .where(eq(userProgress.userId, userId));

  // 清除 user_progress 的缓存
  try {
    await redis.del(`user_progress:${userId}`);
  } catch (e) {
    console.error("Redis DEL Error (user_progress):", e);
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
