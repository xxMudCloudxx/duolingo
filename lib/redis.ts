import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("Redis connection URL is not defined");
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    // 重试间隔：最小 50ms，最大 2s，指数退避
    return Math.min(times * 50, 2000);
  },
  reconnectOnError(err) {
    // 遇到 READONLY 错误时自动重连（Redis 故障转移场景）
    return err.message.includes("READONLY");
  },
});

// 注册 error 事件监听器，防止 "Unhandled error event" 刷屏
redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

/**
 * 集中管理所有 Redis 缓存键，避免多文件硬编码导致拼写不一致
 */
export const cacheKeys = {
  userProgress: (userId: string) => `user_progress:${userId}`,
  leaderboard: () => "leaderboard",
  quests: (userId: string, dateStr: string) => `quests:${userId}:${dateStr}`,
  dailyProgress: (userId: string, dateStr: string) =>
    `daily_progress:${userId}:${dateStr}`,
};

export { redis };
