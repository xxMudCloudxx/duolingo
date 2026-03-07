// app/api/challenges/[challengeId]/route.ts
import { challenges } from "@/db/schema";
import {
  createGetByIdRoute,
  createPutRoute,
  createDeleteRoute,
} from "@/lib/api-utils";

export const GET = createGetByIdRoute(challenges, challenges.id);
export const PUT = createPutRoute(challenges, challenges.id);
export const DELETE = createDeleteRoute(challenges, challenges.id);
