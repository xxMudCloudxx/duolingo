import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ challengeId: number }> }
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { challengeId } = await params;
  const data = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ challengeId: number }> }
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { challengeId } = await params;

  const data = await db
    .update(challenges)
    .set({
      ...body,
    })
    .where(eq(challenges.id, challengeId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ challengeId: number }> }
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { challengeId } = await params;
  const data = await db
    .delete(challenges)
    .where(eq(challenges.id, challengeId))
    .returning();

  return NextResponse.json(data[0]);
};