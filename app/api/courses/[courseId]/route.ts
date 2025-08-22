import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ courseId: number }> }
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { courseId } = await params;
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ courseId: number }> }
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const body = await req.json();
  const { courseId } = await params;
  const data = await db
    .update(courses)
    .set({
      ...body,
    })
    .where(eq(courses.id, courseId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ courseId: number }> }
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { courseId } = await params;
  const data = await db
    .delete(courses)
    .where(eq(courses.id, courseId))
    .returning();

  return NextResponse.json(data[0]);
};
