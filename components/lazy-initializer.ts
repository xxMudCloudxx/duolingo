"use client";

import { preloadAudio, preloadRouteComponents } from "./lazy-loading";

let initialized = false;

export const initializeLazyLoading = () => {
  // 防止重复初始化
  if (initialized) {
    return;
  }
  initialized = true;

  // 延迟启动预加载，避免影响初始页面加载
  setTimeout(() => {
    // 这两个函数是安全的，因为它们内部的 import() 是动态的，
    // 不会立即在模块加载时被解析。
    preloadRouteComponents();
    preloadAudio(["/correct.wav", "/incorrect.wav", "/finish.mp3"]);
  }, 2000);
};
