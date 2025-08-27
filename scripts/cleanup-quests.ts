import { sql, lt } from "drizzle-orm";
import db from "@/db/drizzle";
import { userDailyQuests } from "@/db/schema";

// --- 配置 ---
// 定义数据保留期限（单位：天）。
const RETENTION_DAYS = 3;

/**
 * Performs a one-time cleanup of old user daily-quest records.
 *
 * Deletes rows from the `userDailyQuests` table whose `assignedAt` timestamp
 * is earlier than the configured retention window (RETENTION_DAYS). On error
 * the process exits with code 1 to signal failure to the caller/scheduler.
 *
 * @returns A promise that resolves when the cleanup completes.
 */
async function main() {
  console.log("🚀 Starting daily quests cleanup job...");

  try {
    // 计算30天前的日期
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - RETENTION_DAYS);

    console.log(
      `🧹 Deleting records older than: ${retentionDate.toISOString()}`
    );

    // 使用 Drizzle ORM 执行删除操作
    // 删除 userDailyQuests 表中 assignedAt 早于 retentionDate 的所有记录
    const result = await db
      .delete(userDailyQuests)
      .where(lt(userDailyQuests.assignedAt, retentionDate));

    console.log("✅ Cleanup job finished successfully.");
    // Drizzle/kit 0.20+ with pg 8.11+ might return more info in result
    // For now, we assume success if no error is thrown.
    console.log(`📊 Records deleted (approximate).`);
  } catch (error) {
    console.error("❌ An error occurred during the cleanup job:", error);
    // 在生产环境中，这里应该有更详细的错误上报，例如发送到 Sentry
    process.exit(1); // 以错误码退出，通知调度器任务失败
  }

  // Neon 的 Serverless Driver 会自动管理连接，通常不需要手动关闭
  console.log("👋 Job complete.");
}

main();
