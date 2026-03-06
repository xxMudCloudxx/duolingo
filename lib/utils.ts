import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, toZonedTime, fromZonedTime } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

// 格式化剩余时间的辅助函数
export const formatTimeLeft = (seconds: number) => {
  if (seconds < 60) return "< 1m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} left`;
  }
  return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
};

// 返回 'YYYY-MM-DD' 格式，基于用户时区（默认 UTC）
export const getTodayDateString = (timeZone?: string) => {
  if (timeZone) {
    return format(toZonedTime(new Date(), timeZone), "yyyy-MM-dd");
  }
  return new Date().toISOString().split("T")[0];
};

/**
 * 计算从现在到指定时区下一个凌晨5点所剩的秒数
 * @param timeZone - 用户时区字符串 (例如 "Asia/Tokyo")
 * @returns {number} 剩余的秒数
 */
export const getSecondsUntilNext5AM = (timeZone: string): number => {
  try {
    // 获取当前时刻的 Date 对象 (UTC 时间)
    const now = new Date();

    // 将当前时刻转换为用户所在时区的时间
    const nowInUserTz = toZonedTime(now, timeZone);

    // 在用户时区下，构建下一个凌晨 5 点的时间对象
    const next5AMInUserTz = new Date(nowInUserTz.getTime()); // 创建一个副本
    next5AMInUserTz.setHours(5, 0, 0, 0);

    // 如果当前时间已经超过了今天的凌晨 5 点，则目标是明天的凌晨 5 点
    if (nowInUserTz.getTime() > next5AMInUserTz.getTime()) {
      next5AMInUserTz.setDate(next5AMInUserTz.getDate() + 1);
    }

    // 使用 fromZonedTime 将用户时区的“下一个5点”转换回 UTC Date 对象
    const next5AMUTC = fromZonedTime(next5AMInUserTz, timeZone);

    // 现在两个时间都是标准的 UTC 时间，可以安全地计算差值
    const diffInMs = next5AMUTC.getTime() - now.getTime();

    return Math.ceil(diffInMs / 1000);
  } catch (error) {
    console.error("Error calculating seconds until next 5 AM:", error);
    return 60 * 60 * 24; // 出错时返回默认值
  }
};
