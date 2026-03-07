// app/api/challengeOptions/[challengeOptionId]/route.ts
import { challengeOptions } from "@/db/schema";
import {
  createGetByIdRoute,
  createPutRoute,
  createDeleteRoute,
} from "@/lib/api-utils";

export const GET = createGetByIdRoute(challengeOptions, challengeOptions.id);
export const PUT = createPutRoute(challengeOptions, challengeOptions.id);
export const DELETE = createDeleteRoute(challengeOptions, challengeOptions.id);
