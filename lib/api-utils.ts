// lib/api-utils.ts
// 标准化的API工具函数

import { NextResponse } from "next/server";
import { InferInsertModel, SQL, count, and, eq } from "drizzle-orm";
import { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";
import {
  ParsedQueryParams,
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  RESOURCE_DEFAULT_SORT,
  createContentRangeHeader,
} from "./api-types";
import { isAdmin } from "./admin";
import db from "@/db/drizzle";

type JsonObject = Record<string, unknown>;

/**
 * 解析URL搜索参数为标准化格式
 * @param searchParams - URL搜索参数
 * @param resourceType - 资源类型，用于获取默认排序
 * @returns 解析后的查询参数
 */
export function parseQueryParams(
  searchParams: URLSearchParams,
  resourceType: keyof typeof RESOURCE_DEFAULT_SORT,
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
  const filter = filterParam ? JSON.parse(filterParam) : {};

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
  resourceName: string,
): NextResponse {
  const headers = new Headers();
  headers.set(
    "Content-Range",
    createContentRangeHeader(resourceName, start, end, total),
  );
  headers.set("Access-Control-Expose-Headers", "Content-Range");

  return new NextResponse(JSON.stringify(data), { headers });
}

/**
 * Creates a generic GET list route handler
 */
export function createGetListRoute<
  TTable extends AnyPgTable,
  TFilter extends Record<string, unknown> = Record<string, unknown>,
>(
  resourceName: keyof typeof RESOURCE_DEFAULT_SORT,
  table: TTable,
  buildWhereFn?: (filter: TFilter) => (SQL | undefined)[],
) {
  return async (req: Request) => {
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const { pagination, filter } = parseQueryParams(searchParams, resourceName);
    const { start, end, limit } = pagination;

    const tableRef = table as AnyPgTable;

    const whereCondition = buildWhereFn
      ? and(
          ...buildWhereFn(filter as TFilter).filter(
            (c): c is SQL => c !== undefined,
          ),
        )
      : undefined;

    const data = whereCondition
      ? await db
          .select()
          .from(tableRef)
          .where(whereCondition)
          .limit(limit)
          .offset(start)
      : await db.select().from(tableRef).limit(limit).offset(start);

    const totalResult = whereCondition
      ? await db.select({ value: count() }).from(tableRef).where(whereCondition)
      : await db.select({ value: count() }).from(tableRef);
    const total = totalResult[0]?.value ?? 0;

    return createApiResponse(data, total, start, end, resourceName);
  };
}

/**
 * Creates a generic POST route handler
 */
export function createPostRoute<TTable extends AnyPgTable>(table: TTable) {
  return async (req: Request) => {
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const body = (await req.json()) as InferInsertModel<TTable>;
    const data = (await db
      .insert(table)
      .values(body)
      .returning()) as JsonObject[];
    return NextResponse.json(data[0] ?? null);
  };
}

function parseIdFromParams(params: Record<string, string | number>): number {
  const idParam = Object.values(params)[0];
  const id =
    typeof idParam === "string" ? Number.parseInt(idParam, 10) : idParam;
  return id;
}

/**
 * Creates a generic GET (by ID) route handler
 */
export function createGetByIdRoute<TTable extends AnyPgTable>(
  table: TTable,
  idColumn: AnyPgColumn,
) {
  return async (
    req: Request,
    { params }: { params: Promise<{ [key: string]: string | number }> },
  ) => {
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const resolvedParams = await params;
    const id = parseIdFromParams(resolvedParams);
    if (Number.isNaN(id)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const tableRef = table as AnyPgTable;
    const data = (await db
      .select()
      .from(tableRef)
      .where(eq(idColumn, id))) as JsonObject[];

    return NextResponse.json(data[0] || null);
  };
}

/**
 * Creates a generic PUT route handler
 */
export function createPutRoute<TTable extends AnyPgTable>(
  table: TTable,
  idColumn: AnyPgColumn,
) {
  return async (
    req: Request,
    { params }: { params: Promise<{ [key: string]: string | number }> },
  ) => {
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = (await req.json()) as Partial<InferInsertModel<TTable>>;
    const resolvedParams = await params;
    const id = parseIdFromParams(resolvedParams);
    if (Number.isNaN(id)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const data = (await db
      .update(table)
      .set(body)
      .where(eq(idColumn, id))
      .returning()) as JsonObject[];

    return NextResponse.json(data[0]);
  };
}

/**
 * Creates a generic DELETE route handler
 */
export function createDeleteRoute<TTable extends AnyPgTable>(
  table: TTable,
  idColumn: AnyPgColumn,
) {
  return async (
    req: Request,
    { params }: { params: Promise<{ [key: string]: string | number }> },
  ) => {
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const resolvedParams = await params;
    const id = parseIdFromParams(resolvedParams);
    if (Number.isNaN(id)) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const data = (await db
      .delete(table)
      .where(eq(idColumn, id))
      .returning()) as JsonObject[];

    return NextResponse.json(data[0] ?? null);
  };
}
