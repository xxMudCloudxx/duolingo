"use client";

import { lazy, Suspense, ComponentType, useEffect } from "react";
import { PageLoading } from "@/components/loading-indicator";

// 懒加载组件包装器
interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const LazyWrapper = ({ fallback, children }: LazyWrapperProps) => {
  return <Suspense fallback={fallback || <PageLoading />}>{children}</Suspense>;
};

// 创建懒加载组件的工具函数
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);

  return (props: React.ComponentProps<T>) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

// // 懒加载的管理面板组件
// export const LazyAdminApp = createLazyComponent(
//   () => import("@/app/admin/app"),
//   <PageLoading text="加载管理面板..." />
// );

// // 懒加载的课程组件
// export const LazyLeaderboard = createLazyComponent(
//   () => import("@/app/(main)/leaderboard/page"),
//   <PageLoading text="加载排行榜..." />
// );

// // 懒加载的商店组件
// export const LazyShop = createLazyComponent(
//   () => import("@/app/(main)/shop/page"),
//   <PageLoading text="加载商店..." />
// );

// // 懒加载的任务组件
// export const LazyQuests = createLazyComponent(
//   () => import("@/app/(main)/quests/page"),
//   <PageLoading text="加载任务..." />
// );

// // 懒加载的课程选择组件
// export const LazyCourses = createLazyComponent(
//   () => import("@/app/(main)/courses/page"),
//   <PageLoading text="加载课程..." />
// );

// 预加载策略
interface PreloadOptions {
  priority?: "high" | "low";
  delay?: number;
}

class PreloadManager {
  private preloadedComponents = new Set<string>();
  private preloadQueue: Array<{
    name: string;
    loader: () => Promise<any>;
    options: PreloadOptions;
  }> = [];
  private isProcessing = false;

  // 添加预加载任务
  addPreload(
    name: string,
    loader: () => Promise<any>,
    options: PreloadOptions = {}
  ) {
    if (this.preloadedComponents.has(name)) {
      return;
    }

    this.preloadQueue.push({ name, loader, options });
    this.processQueue();
  }

  // 处理预加载队列
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // 按优先级排序
    this.preloadQueue.sort((a, b) => {
      const priorityA = a.options.priority === "high" ? 1 : 0;
      const priorityB = b.options.priority === "high" ? 1 : 0;
      return priorityB - priorityA;
    });

    while (this.preloadQueue.length > 0) {
      const task = this.preloadQueue.shift()!;

      try {
        // 如果有延迟，等待指定时间
        if (task.options.delay) {
          await new Promise((resolve) =>
            setTimeout(resolve, task.options.delay)
          );
        }

        await task.loader();
        this.preloadedComponents.add(task.name);
        console.log(`预加载完成: ${task.name}`);
      } catch (error) {
        console.warn(`预加载失败: ${task.name}`, error);
      }

      // 在高优先级任务之间添加小延迟，避免阻塞主线程
      if (task.options.priority === "high") {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    this.isProcessing = false;
  }

  // 检查组件是否已预加载
  isPreloaded(name: string): boolean {
    return this.preloadedComponents.has(name);
  }

  // 获取预加载状态
  getStatus() {
    return {
      preloaded: this.preloadedComponents.size,
      pending: this.preloadQueue.length,
      processing: this.isProcessing,
    };
  }
}

export const preloadManager = new PreloadManager();

// 路由级别的预加载
export const preloadRouteComponents = () => {
  // 预加载高优先级组件（用户可能很快访问的）
  preloadManager.addPreload(
    "leaderboard",
    () => import("@/app/(main)/leaderboard/page"),
    { priority: "high", delay: 1000 }
  );

  preloadManager.addPreload("shop", () => import("@/app/(main)/shop/page"), {
    priority: "high",
    delay: 1500,
  });

  // 预加载低优先级组件（用户可能稍后访问的）
  preloadManager.addPreload(
    "quests",
    () => import("@/app/(main)/quests/page"),
    { priority: "low", delay: 3000 }
  );

  preloadManager.addPreload(
    "courses",
    () => import("@/app/(main)/courses/page"),
    { priority: "low", delay: 4000 }
  );

  preloadManager.addPreload("admin", () => import("@/app/admin/app"), {
    priority: "low",
    delay: 5000,
  });
};

// 基于用户行为的智能预加载
export const smartPreload = {
  // 当用户悬停在导航链接上时预加载
  onHover: (componentName: string, loader: () => Promise<any>) => {
    preloadManager.addPreload(componentName, loader, { priority: "high" });
  },

  // 当用户完成课程时预加载下一个可能的页面
  onLessonComplete: () => {
    preloadManager.addPreload(
      "leaderboard",
      () => import("@/app/(main)/leaderboard/page"),
      { priority: "high", delay: 500 }
    );

    preloadManager.addPreload("shop", () => import("@/app/(main)/shop/page"), {
      priority: "high",
      delay: 1000,
    });
  },

  // 当用户进入学习页面时预加载相关组件
  onEnterLearn: () => {
    preloadManager.addPreload(
      "quests",
      () => import("@/app/(main)/quests/page"),
      { priority: "high", delay: 2000 }
    );
  },
};

// 组件级别的懒加载 Hook
export const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  deps: any[] = []
) => {
  const LazyComponent = lazy(importFn);

  return LazyComponent;
};

// 图片懒加载组件
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  className,
  placeholder,
  onLoad,
}: LazyImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={onLoad}
      style={{
        backgroundImage: placeholder ? `url(${placeholder})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
};

// 音频懒加载
export const preloadAudio = (sources: string[]) => {
  sources.forEach((src) => {
    const audio = new Audio();
    audio.preload = "metadata"; // 只预加载元数据，不预加载整个文件
    audio.src = src;
  });
};
