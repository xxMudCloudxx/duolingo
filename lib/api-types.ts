// lib/api-types.ts
// 统一的API接口类型定义

// === 基础查询参数类型 ===
export interface PaginationParams {
  range?: [number, number]; // [start, end]
}

export interface SortParams {
  sort?: [string, "ASC" | "DESC"]; // [field, order]
}

export interface FilterParams {
  filter?: Record<string, string | number | boolean | Array<string | number>>;
}

export interface BaseQueryParams
  extends PaginationParams, SortParams, FilterParams {}

// === 具体资源的筛选参数 ===
export interface UnitFilterParams {
  courseIds?: number[];
}

export interface LessonFilterParams {
  unitIds?: number[];
  courseId?: number; // 用于级联筛选，但实际查询时会被忽略
}

export interface ChallengeFilterParams {
  lessonIds?: number[];
}

export interface ChallengeOptionFilterParams {
  challengeIds?: number[];
}

// === 查询参数解析结果 ===
export interface ParsedQueryParams {
  pagination: {
    start: number;
    end: number;
    limit: number;
  };
  sort: {
    field: string;
    order: "ASC" | "DESC";
  };
  filter: Record<string, string | number | boolean | Array<string | number>>;
}

// === 默认值常量 ===
export const DEFAULT_PAGINATION: [number, number] = [0, 9];
export const DEFAULT_SORT: [string, "ASC" | "DESC"] = ["id", "ASC"];

// === 资源特定的默认排序 ===
export const RESOURCE_DEFAULT_SORT = {
  courses: ["id", "ASC"] as [string, "ASC" | "DESC"],
  units: ["order", "ASC"] as [string, "ASC" | "DESC"],
  lessons: ["order", "ASC"] as [string, "ASC" | "DESC"],
  challenges: ["order", "ASC"] as [string, "ASC" | "DESC"],
  challengeOptions: ["id", "ASC"] as [string, "ASC" | "DESC"],
};

// === 内容范围头部格式 ===
export const createContentRangeHeader = (
  resource: string,
  start: number,
  end: number,
  total: number,
): string => {
  return `${resource} ${start}-${end}/${total}`;
};
