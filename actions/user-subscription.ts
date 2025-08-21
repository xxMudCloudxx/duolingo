"use server";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { getUserSubscription } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  SUBSCRIPTION_PLANS_LIFETIME_POINTS,
  SUBSCRIPTION_PLANS_MONTHLY_POINTS,
  SUBSCRIPTION_PLANS_YEARLY_POINTS,
} from "@/constants";

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    type: "MONTHLY" as const,
    points: SUBSCRIPTION_PLANS_MONTHLY_POINTS,
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days
    name: "Monthly Plan",
    description: "5,000 points, valid for 30 days",
  },
  YEARLY: {
    type: "YEARLY" as const,
    points: SUBSCRIPTION_PLANS_YEARLY_POINTS,
    duration: 365 * 24 * 60 * 60 * 1000, // 365 days
    name: "Yearly Plan",
    description: "30,000 points, valid for 1 year",
  },
  LIFETIME: {
    type: "LIFETIME" as const,
    points: SUBSCRIPTION_PLANS_LIFETIME_POINTS,
    duration: null, // permanent
    name: "Lifetime Plan",
    description: "99,999 points, valid forever",
  },
};

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

  try {
    const existingSubscription = await getUserSubscription();
    const now = new Date();
    const expiresAt = plan.duration
      ? new Date(now.getTime() + plan.duration)
      : null;

    if (existingSubscription) {
      // 更新现有订阅
      await db
        .update(userSubscription)
        .set({
          subscriptionType: plan.type,
          points: plan.points,
          expiresAt,
          updatedAt: now,
        })
        .where(eq(userSubscription.userId, userId));
    } else {
      // 创建新订阅
      await db.insert(userSubscription).values({
        userId,
        subscriptionType: plan.type,
        points: plan.points,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath("/shop");
    revalidatePath("/learn");

    return { success: true, message: `Successfully purchased ${plan.name}` };
  } catch (error) {
    console.error("Failed to purchase subscription:", error);
    throw new Error("Failed to purchase subscription, please try again later");
  }
};

export const getSubscriptionPlans = async () => {
  return SUBSCRIPTION_PLANS;
};
