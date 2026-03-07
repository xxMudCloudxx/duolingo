// app/api/challenges/route.ts
import { challenges } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { createGetListRoute, createPostRoute } from "@/lib/api-utils";
import { ChallengeFilterParams } from "@/lib/api-types";

export const GET = createGetListRoute(
  "challenges",
  challenges,
  (filter: ChallengeFilterParams) => [
    filter.lessonIds && filter.lessonIds.length > 0
      ? inArray(challenges.lessonId, filter.lessonIds)
      : undefined,
  ],
);
export const POST = createPostRoute(challenges);
