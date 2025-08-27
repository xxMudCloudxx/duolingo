import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toZonedTime } from "date-fns-tz";

/**
 * Combines multiple class name inputs into a single Tailwind-merged string.
 *
 * Accepts any inputs supported by `clsx` (strings, arrays, conditional objects, etc.), resolves them into a single class string, then deduplicates/merges Tailwind utility classes via `tailwind-merge`.
 *
 * @param inputs - One or more class values to be resolved and merged.
 * @returns The resulting merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Builds an absolute URL by prefixing the provided path with the application's public base URL.
 *
 * The base URL is taken from the NEXT_PUBLIC_APP_URL environment variable. The function does not
 * validate or normalize slashes, so `path` should include a leading '/' if required (e.g. '/login').
 *
 * @param path - The path portion to append to the app base URL.
 * @returns The concatenation of `process.env.NEXT_PUBLIC_APP_URL` and `path`.
 */
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

// 返回 'YYYY-MM-DD' 格式.
export const getTodayDateString = () => new Date().toISOString().split("T")[0];

/**
 * 计算从现在到指定时区下一个凌晨5点所剩的秒数
 * @param timeZone - 用户时区字符串 (例如 "Asia/Tokyo")
 * @returns {number} 剩余的秒数
 */
export const getSecondsUntilNext5AM = (timeZone: string): number => {
  try {
    // 获取当前在用户时区的日期和时间
    const nowInUserTz = toZonedTime(new Date(), timeZone);

    // 创建一个代表今天凌晨5点的时间对象 (在用户时区)
    const next5AMInUserTz = new Date(nowInUserTz);
    next5AMInUserTz.setHours(5, 0, 0, 0);

    // 如果当前时间已经过了今天的凌晨5点，那么目标就是明天的凌晨5点
    if (nowInUserTz.getTime() > next5AMInUserTz.getTime()) {
      next5AMInUserTz.setDate(next5AMInUserTz.getDate() + 1);
    }

    // 计算当前时间与目标时间之间的毫秒差
    const diffInMs = next5AMInUserTz.getTime() - nowInUserTz.getTime();

    // 将毫秒差转换为秒，并向上取整
    return Math.ceil(diffInMs / 1000);
  } catch (error) {
    console.error("Error calculating seconds until next 5 AM:", error);
    // 在出错时返回一个安全的默认值 (例如, 24小时)
    return 60 * 60 * 24;
  }
};
