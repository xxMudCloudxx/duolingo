import { cache } from 'react';

// 前端缓存配置
const CACHE_KEYS = {
  USER_PROGRESS: 'user_progress',
  LESSON_DATA: 'lesson_data',
  COURSE_DATA: 'course_data',
  CHALLENGE_OPTIONS: 'challenge_options',
} as const;

const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5分钟
  MEDIUM: 15 * 60 * 1000, // 15分钟
  LONG: 60 * 60 * 1000, // 1小时
} as const;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  duration: number;
}

class FrontendCache {
  private cache = new Map<string, CacheItem<any>>();
  private preloadQueue = new Set<string>();

  // 设置缓存
  set<T>(key: string, data: T, duration: number = CACHE_DURATION.MEDIUM): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration,
    });
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.duration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
  }

  // 预加载资源
  async preload(key: string, fetcher: () => Promise<any>, duration?: number): Promise<void> {
    if (this.preloadQueue.has(key)) return;
    
    this.preloadQueue.add(key);
    try {
      const data = await fetcher();
      this.set(key, data, duration);
    } catch (error) {
      console.warn(`预加载失败: ${key}`, error);
    } finally {
      this.preloadQueue.delete(key);
    }
  }

  // 批量预加载
  async preloadBatch(items: Array<{ key: string; fetcher: () => Promise<any>; duration?: number }>): Promise<void> {
    const promises = items.map(item => this.preload(item.key, item.fetcher, item.duration));
    await Promise.allSettled(promises);
  }

  // 获取缓存统计信息
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const [key, item] of this.cache.entries()) {
      const isExpired = now - item.timestamp > item.duration;
      if (isExpired) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      preloading: this.preloadQueue.size,
    };
  }
}

// 创建全局缓存实例
export const frontendCache = new FrontendCache();

// 缓存装饰器
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  duration: number = CACHE_DURATION.MEDIUM
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = frontendCache.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    frontendCache.set(key, result, duration);
    return result;
  }) as T;
}

// 预加载常用资源的工具函数
export const preloadCommonResources = async () => {
  // 预加载音频文件
  const audioFiles = ['/correct.wav', '/incorrect.wav', '/finish.mp3'];
  audioFiles.forEach(src => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
  });

  // 预加载关键图片
  const imageFiles = [
    '/mascot.svg',
    '/heart.svg',
    '/points.svg',
    '/finish.svg'
  ];
  
  imageFiles.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// 导出缓存键和持续时间常量
export { CACHE_KEYS, CACHE_DURATION };

// React缓存包装器
export const createCachedQuery = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  return cache(fn);
};