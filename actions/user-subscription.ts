"use server";

import db from "@/db/drizzle";
import { userProgress, userSubscription } from "@/db/schema";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SUBSCRIPTION_PLANS } from "@/constants";

export const purchaseSubscription = async (
  planType: keyof typeof SUBSCRIPTION_PLANS
) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized access");
  }

  const plan = SUBSCRIPTION_PLANS[planType];
  if (!plan) {
    throw new Error("Invalid subscription plan");
  }

  const currentUserProgress = await getUserProgress();
  const existingSubscription = await getUserSubscription();

  if (!currentUserProgress) {
    throw new Error("UserProgress not found");
  }

  if (currentUserProgress.points < plan.points) {
    throw new Error("Not enough points");
  }

  try {
    const now = new Date();

    const startDate =
      existingSubscription &&
      existingSubscription?.expiresAt &&
      existingSubscription?.expiresAt > now
        ? existingSubscription?.expiresAt
        : now;

    const expiresAt = plan.duration
      ? new Date(startDate.getTime() + plan.duration)
      : null;

    if (existingSubscription) {
      await db
        .update(userSubscription)
        .set({
          subscriptionType: plan.type,
          points: plan.points,
          expiresAt,
          updatedAt: now,
        })
        .where(eq(userSubscription.userId, currentUserProgress.userId));
    } else {
      await db.insert(userSubscription).values({
        userId,
        subscriptionType: plan.type,
        points: plan.points,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      });
    }

    await db
      .update(userProgress)
      .set({
        points: currentUserProgress.points - plan.points,
      })
      .where(eq(userProgress.userId, currentUserProgress.userId));

    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/leaderboard");
    revalidatePath("/quests");
    return { success: true, message: `Successfully purchased ${plan.name}` };
  } catch (error) {
    console.error("Failed to purchase subscription:", error);
    throw new Error("Failed to purchase subscription, please try again later");
  }
};
