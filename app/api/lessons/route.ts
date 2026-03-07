// app/api/lessons/route.ts
import { lessons } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { createGetListRoute, createPostRoute } from "@/lib/api-utils";
import { LessonFilterParams } from "@/lib/api-types";

export const GET = createGetListRoute(
  "lessons",
  lessons,
  (filter: LessonFilterParams) => [
    filter.unitIds && filter.unitIds.length > 0
      ? inArray(lessons.unitId, filter.unitIds)
      : undefined,
  ],
);
export const POST = createPostRoute(lessons);
