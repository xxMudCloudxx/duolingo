// app/api/units/route.ts
import { units } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { createGetListRoute, createPostRoute } from "@/lib/api-utils";
import { UnitFilterParams } from "@/lib/api-types";

export const GET = createGetListRoute(
  "units",
  units,
  (filter: UnitFilterParams) => [
    filter.courseIds && filter.courseIds.length > 0
      ? inArray(units.courseId, filter.courseIds)
      : undefined,
  ],
);
export const POST = createPostRoute(units);
