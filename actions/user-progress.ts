"use server";

import { POINTS_TO_REFILL } from "@/constants";
import db from "@/db/drizzle";
import {
  getCourseById,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import { redis, cacheKeys } from "@/lib/redis";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const course = await getCourseById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.units.length || !course.units[0].lessons.length) {
    throw new Error("Course is empty");
  }
  const cacheKey = cacheKeys.userProgress(userId); // 定义缓存键
  const existingUserProgress = await getUserProgress();

  if (existingUserProgress) {
    await db
      .update(userProgress)
      .set({
        activeCourseId: courseId,
        userName: user.firstName || "User",
        userImgSrc: user.imageUrl || "/icons/mascot.svg",
      })
      .where(eq(userProgress.userId, userId));

    // --- 添加缓存清除逻辑 ---
    try {
      await redis.del(cacheKey);
      console.log("User progress cache invalidated after update.");
    } catch (e) {
      console.error("Redis DEL Error (user_progress):", e);
    }
    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || "User",
    userImgSrc: user.imageUrl || "/icons/mascot.svg",
  });

  // --- 添加缓存清除逻辑 ---
  try {
    await redis.del(cacheKey);
    console.log("User progress cache invalidated after update.");
  } catch (e) {
    console.error("Redis DEL Error (user_progress):", e);
  }
  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
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
    throw new Error("Challenge not found");
  }

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    return { error: "practice" };
  }

  if (userSubscription?.isActive) {
    return { error: "subscription" };
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
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
  revalidatePath(`/lesson/${challenge.lessonId}`);
};

export const refillHearts = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 前置检查：用于给前端返回明确的错误信息
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("UserProgress not found");
  }

  if (currentUserProgress.hearts === 5) {
    throw new Error("Hearts are already full");
  }

  if (currentUserProgress.points < POINTS_TO_REFILL) {
    throw new Error("Not enough points");
  }

  // 原子 SQL：即使前置检查通过，仍用 WHERE 条件兜底防止并发双花
  const result = await db
    .update(userProgress)
    .set({
      hearts: 5,
      points: sql`${userProgress.points} - ${POINTS_TO_REFILL}`,
    })
    .where(
      and(
        eq(userProgress.userId, userId),
        sql`${userProgress.points} >= ${POINTS_TO_REFILL}`,
        sql`${userProgress.hearts} < 5`,
      ),
    )
    .returning(); // 告诉 PostgreSQL 返回被成功更新的行数据

  // 如果数组为空，说明刚才的 WHERE 条件没拼上（即：被别人抢先花光了钱，或者爱心已经满了）
  if (result.length === 0) {
    throw new Error("Transaction failed: Not enough points or hearts full");
  }

  // 清除 user_progress 的缓存
  try {
    await redis.del(cacheKeys.userProgress(userId));
  } catch (e) {
    console.error("Redis DEL Error (user_progress):", e);
  }
  revalidatePath("/learn");
  revalidatePath("/shop");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
