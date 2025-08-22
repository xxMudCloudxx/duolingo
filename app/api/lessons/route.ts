// app/api/lessons/route.ts
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { inArray } from "drizzle-orm";
import {
  parseQueryParams,
  createApiResponse,
  buildWhereConditions,
  applyWhereConditions,
} from "@/lib/api-utils";
import { LessonFilterParams } from "@/lib/api-types";
import { isAdmin } from "@/lib/admin";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const { pagination, filter } = parseQueryParams(searchParams, "lessons");

  const typedFilter = filter as LessonFilterParams;
  const { start, end, limit } = pagination;

  let query = db.select().from(lessons);

  // 构建WHERE条件
  const whereConditions = buildWhereConditions({
    unitIds:
      typedFilter.unitIds && typedFilter.unitIds.length > 0
        ? inArray(lessons.unitId, typedFilter.unitIds)
        : undefined,
  });

  const whereCondition = applyWhereConditions(whereConditions);
  if (whereCondition) {
    query = query.where(whereCondition) as typeof query;
  }

  const data = await query.limit(limit).offset(start);
  const total = (await db.select().from(lessons)).length;

  return createApiResponse(data, total, start, end, "lessons");
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const body = await req.json();
  const data = await db
    .insert(lessons)
    .values({ ...body })
    .returning();
  return NextResponse.json(data[0]);
};
