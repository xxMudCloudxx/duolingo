import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import db from "@/db/drizzle";
import { userDailyQuests } from "@/db/schema";

// 可以从环境变量中读取一个密钥
/**
 * HTTP GET route handler that deletes user daily-quest records older than a retention period.
 *
 * Performs a cleanup by removing rows from the `userDailyQuests` table whose `assignedAt`
 * timestamp is earlier than (now - 3 days). On success returns a JSON response with status 200
 * and message "Cleanup successful."; on failure returns status 500 and message "Internal Server Error".
 *
 * Note: an optional secret-based security check is present in commented code and can be enabled
 * to restrict invocation (not enforced by this function as implemented).
 */

export async function GET() {
  // 可以在这里添加安全校验
  // const { searchParams } = new URL(request.url);
  // if (searchParams.get('secret') !== CRON_SECRET) {
  //   return NextResponse.json({ status: 401, message: 'Unauthorized' });
  // }

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
