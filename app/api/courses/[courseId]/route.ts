// app/api/courses/[courseId]/route.ts
import { courses } from "@/db/schema";
import {
  createGetByIdRoute,
  createPutRoute,
  createDeleteRoute,
} from "@/lib/api-utils";

export const GET = createGetByIdRoute(courses, courses.id);
export const PUT = createPutRoute(courses, courses.id);
export const DELETE = createDeleteRoute(courses, courses.id);
