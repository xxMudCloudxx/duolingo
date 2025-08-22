// app/api/challengeOptions/route.ts
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { inArray } from "drizzle-orm";
import {
  applyWhereConditions,
  buildWhereConditions,
  createApiResponse,
  parseQueryParams,
} from "@/lib/api-utils";
import { ChallengeOptionFilterParams } from "@/lib/api-types";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const { pagination, filter } = parseQueryParams(
    searchParams,
    "challengeOptions"
  );

  const typedFilter = filter as ChallengeOptionFilterParams;
  const { start, end, limit } = pagination;

  let query = db.select().from(challengeOptions);

  // 构建WHERE条件
  const whereConditions = buildWhereConditions({
    challengeIds:
      typedFilter.challengeIds && typedFilter.challengeIds.length > 0
        ? inArray(challengeOptions.challengeId, typedFilter.challengeIds)
        : undefined,
  });

  const whereCondition = applyWhereConditions(whereConditions);
  if (whereCondition) {
    query = query.where(whereCondition) as typeof query;
  }

  const data = await query.limit(limit).offset(start);
  const total = (await db.select().from(challengeOptions)).length;

  return createApiResponse(data, total, start, end, "challengeOptions");
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const body = await req.json();
  const data = await db
    .insert(challengeOptions)
    .values({ ...body })
    .returning();
  return NextResponse.json(data[0]);
};
