// app/api/units/route.ts
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { inArray } from "drizzle-orm";
import {
  applyWhereConditions,
  buildWhereConditions,
  createApiResponse,
  parseQueryParams,
} from "@/lib/api-utils";
import { UnitFilterParams } from "@/lib/api-types";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const { pagination, filter } = parseQueryParams(searchParams, "units");

  const typedFilter = filter as UnitFilterParams;
  const { start, end, limit } = pagination;

  let query = db.select().from(units);

  // 构建WHERE条件
  const whereConditions = buildWhereConditions({
    courseIds:
      typedFilter.courseIds && typedFilter.courseIds.length > 0
        ? inArray(units.courseId, typedFilter.courseIds)
        : undefined,
  });

  const whereCondition = applyWhereConditions(whereConditions);
  if (whereCondition) {
    query = query.where(whereCondition) as typeof query;
  }

  const data = await query.limit(limit).offset(start);
  const total = (await db.select().from(units)).length;

  return createApiResponse(data, total, start, end, "units");
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const body = await req.json();
  const data = await db
    .insert(units)
    .values({ ...body })
    .returning();
  return NextResponse.json(data[0]);
};
