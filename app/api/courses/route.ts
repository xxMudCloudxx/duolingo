// app/api/courses/route.ts
import { courses } from "@/db/schema";
import { createGetListRoute, createPostRoute } from "@/lib/api-utils";

export const GET = createGetListRoute("courses", courses);
export const POST = createPostRoute(courses);
