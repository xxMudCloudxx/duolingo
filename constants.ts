export const POINTS_TO_REFILL = 10;
export const CHALLENGE_POINTS = 10;

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    type: "MONTHLY" as const,
    points: 5000,
    duration: 30 * 24 * 60 * 60 * 1000, // 30 days
    name: "Monthly Plan",
    description: "5,000 points, valid for 30 days",
  },
  YEARLY: {
    type: "YEARLY" as const,
    points: 30_000,
    duration: 365 * 24 * 60 * 60 * 1000, // 365 days
    name: "Yearly Plan",
    description: "30,000 points, valid for 1 year",
  },
  LIFETIME: {
    type: "LIFETIME" as const,
    points: 99_999,
    duration: null, // permanent
    name: "Lifetime Plan",
    description: "99,999 points, valid forever",
  },
};

export const quests = [
  {
    title: "Earn 20 XP",
    value: 20,
  },
  {
    title: "Earn 50 XP",
    value: 50,
  },
  {
    title: "Earn 100 XP",
    value: 100,
  },
  {
    title: "Earn 500 XP",
    value: 500,
  },
  {
    title: "Earn 1000 XP",
    value: 1000,
  },
];
