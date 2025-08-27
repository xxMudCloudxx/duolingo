import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import db from "@/db/drizzle";
import { userDailyQuests } from "@/db/schema";

// 从环境变量中读取密钥
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // 从 Authorization 请求头中获取密钥
  // Vercel 会自动添加 'Bearer ' 前缀
  const authHeader = request.headers.get("authorization");

  // 检查密钥是否匹配
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const RETENTION_DAYS = 3;
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - RETENTION_DAYS);

  try {
    await db
      .delete(userDailyQuests)
      .where(lt(userDailyQuests.assignedAt, retentionDate));

    return NextResponse.json({ status: 200, message: "Cleanup successful." });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
