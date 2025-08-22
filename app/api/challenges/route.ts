// app/api/challenges/route.ts
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { inArray } from "drizzle-orm";
import {
  applyWhereConditions,
  buildWhereConditions,
  createApiResponse,
  parseQueryParams,
} from "@/lib/api-utils";
import { ChallengeFilterParams } from "@/lib/api-types";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const { pagination, filter } = parseQueryParams(searchParams, "challenges");

  const typedFilter = filter as ChallengeFilterParams;
  const { start, end, limit } = pagination;

  let query = db.select().from(challenges);

  // 构建WHERE条件
  const whereConditions = buildWhereConditions({
    lessonIds:
      typedFilter.lessonIds && typedFilter.lessonIds.length > 0
        ? inArray(challenges.lessonId, typedFilter.lessonIds)
        : undefined,
  });

  const whereCondition = applyWhereConditions(whereConditions);
  if (whereCondition) {
    query = query.where(whereCondition) as typeof query;
  }

  const data = await query.limit(limit).offset(start);
  const total = (await db.select().from(challenges)).length;

  return createApiResponse(data, total, start, end, "challenges");
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const body = await req.json();
  const data = await db
    .insert(challenges)
    .values({ ...body })
    .returning();
  return NextResponse.json(data[0]);
};
