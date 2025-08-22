// lib/api-utils.ts
// 标准化的API工具函数

import { NextResponse } from "next/server";
import { SQL } from "drizzle-orm";
import {
  ParsedQueryParams,
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  DEFAULT_FILTER,
  RESOURCE_DEFAULT_SORT,
  createContentRangeHeader,
  ApiError,
} from "./api-types";

/**
 * 解析URL搜索参数为标准化格式
 * @param searchParams - URL搜索参数
 * @param resourceType - 资源类型，用于获取默认排序
 * @returns 解析后的查询参数
 */
export function parseQueryParams(
  searchParams: URLSearchParams,
  resourceType: keyof typeof RESOURCE_DEFAULT_SORT
): ParsedQueryParams {
  // 解析分页参数
  const rangeParam = searchParams.get("range");
  const range = rangeParam ? JSON.parse(rangeParam) : DEFAULT_PAGINATION;
  const [start, end] = range;
  const limit = end - start + 1;

  // 解析排序参数
  const sortParam = searchParams.get("sort");
  const defaultSort = RESOURCE_DEFAULT_SORT[resourceType] || DEFAULT_SORT;
  const sort = sortParam ? JSON.parse(sortParam) : defaultSort;
  const [field, order] = sort;

  // 解析筛选参数
  const filterParam = searchParams.get("filter");
  const filter = filterParam ? JSON.parse(filterParam) : DEFAULT_FILTER;

  return {
    pagination: {
      start,
      end,
      limit,
    },
    sort: {
      field,
      order: order.toUpperCase() as "ASC" | "DESC",
    },
    filter,
  };
}

/**
 * 创建标准化的API响应
 * @param data - 响应数据
 * @param total - 总数量
 * @param start - 起始位置
 * @param end - 结束位置
 * @param resourceName - 资源名称
 * @returns NextResponse对象
 */
export function createApiResponse<T>(
  data: T[],
  total: number,
  start: number,
  end: number,
  resourceName: string
): NextResponse {
  const headers = new Headers();
  headers.set(
    "Content-Range",
    createContentRangeHeader(resourceName, start, end, total)
  );
  headers.set("Access-Control-Expose-Headers", "Content-Range");

  return new NextResponse(JSON.stringify(data), { headers });
}

/**
 * 创建标准化的错误响应
 * @param message - 错误消息
 * @param status - HTTP状态码
 * @returns NextResponse对象
 */
export function createErrorResponse(
  message: string,
  status: number
): NextResponse {
  const error: ApiError = { message, status };
  return new NextResponse(JSON.stringify(error), { status });
}

/**
 * 验证管理员权限的中间件
 * @param isAdminFn - 管理员验证函数
 * @returns 如果不是管理员则返回错误响应，否则返回null
 */
export function validateAdmin(isAdminFn: () => boolean): NextResponse | null {
  if (!isAdminFn()) {
    return createErrorResponse("Unauthorized", 403);
  }
  return null;
}

/**
 * 安全的JSON解析
 * @param jsonString - JSON字符串
 * @param defaultValue - 默认值
 * @returns 解析结果或默认值
 */
export function safeJsonParse<T>(
  jsonString: string | null,
  defaultValue: T
): T {
  if (!jsonString) return defaultValue;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(`Failed to parse JSON: ${jsonString}`, error);
    return defaultValue;
  }
}

/**
 * 构建WHERE条件数组
 * @param conditions - 条件对象
 * @returns SQL条件数组
 */
export function buildWhereConditions(
  conditions: Record<string, SQL | undefined>
): SQL[] {
  return Object.values(conditions).filter(
    (condition): condition is SQL => condition !== undefined
  );
}

/**
 * 应用WHERE条件
 * @param conditions - SQL条件数组
 * @returns 合并后的WHERE条件或undefined
 */
export function applyWhereConditions(conditions: SQL[]): SQL | undefined {
  return conditions.length > 0 ? conditions[0] : undefined;
}

/**
 * 类型安全的排序字段验证
 * @param field - 排序字段
 * @param allowedFields - 允许的字段列表
 * @param defaultField - 默认字段
 * @returns 验证后的字段名
 */
export function validateSortField(
  field: string,
  allowedFields: string[],
  defaultField: string
): string {
  return allowedFields.includes(field) ? field : defaultField;
}

/**
 * 标准化的资源创建响应
 * @param data - 创建的数据
 * @param resourceName - 资源名称
 * @returns NextResponse对象
 */
export function createResourceResponse<T>(data: T): NextResponse {
  return new NextResponse(JSON.stringify(data), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * 标准化的资源更新响应
 * @param data - 更新的数据
 * @returns NextResponse对象
 */
export function updateResourceResponse<T>(data: T): NextResponse {
  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * 标准化的资源删除响应
 * @returns NextResponse对象
 */
export function deleteResourceResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
