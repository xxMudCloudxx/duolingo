"use client";

import { useEffect } from "react";
import { initializeLazyLoading } from "./lazy-initializer";

export const LazyLoaderInitializer = () => {
  useEffect(() => {
    initializeLazyLoading();
  }, []);

  return null;
};
