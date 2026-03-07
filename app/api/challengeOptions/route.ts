// app/api/challengeOptions/route.ts
import { challengeOptions } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { createGetListRoute, createPostRoute } from "@/lib/api-utils";
import { ChallengeOptionFilterParams } from "@/lib/api-types";

export const GET = createGetListRoute(
  "challengeOptions",
  challengeOptions,
  (filter: ChallengeOptionFilterParams) => [
    filter.challengeIds && filter.challengeIds.length > 0
      ? inArray(challengeOptions.challengeId, filter.challengeIds)
      : undefined,
  ],
);
export const POST = createPostRoute(challengeOptions);
