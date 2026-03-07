// app/api/lessons/[lessonId]/route.ts
import { lessons } from "@/db/schema";
import {
  createGetByIdRoute,
  createPutRoute,
  createDeleteRoute,
} from "@/lib/api-utils";

export const GET = createGetByIdRoute(lessons, lessons.id);
export const PUT = createPutRoute(lessons, lessons.id);
export const DELETE = createDeleteRoute(lessons, lessons.id);
