import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import db from "@/db/drizzle";
import { userDailyQuests } from "@/db/schema";

// 从环境变量中读取密钥
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 读取名为 'secret' 的参数值
  const secret = searchParams.get("secret");

  // 检查环境变量中是否有密钥，以及请求传入的密钥是否匹配
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    // 如果不匹配，返回 401 Unauthorized 错误
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
