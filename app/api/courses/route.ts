// app/api/courses/route.ts
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { createApiResponse, parseQueryParams } from "@/lib/api-utils";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const { pagination } = parseQueryParams(searchParams, "courses");

  const { start, end, limit } = pagination;

  const data = await db.select().from(courses).limit(limit).offset(start);
  const total = (await db.select().from(courses)).length;

  return createApiResponse(data, total, start, end, "courses");
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const body = await req.json();
  const data = await db
    .insert(courses)
    .values({ ...body })
    .returning();
  return NextResponse.json(data[0]);
};
