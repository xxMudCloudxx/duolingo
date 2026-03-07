// app/api/units/[unitId]/route.ts
import { units } from "@/db/schema";
import {
  createGetByIdRoute,
  createPutRoute,
  createDeleteRoute,
} from "@/lib/api-utils";

export const GET = createGetByIdRoute(units, units.id);
export const PUT = createPutRoute(units, units.id);
export const DELETE = createDeleteRoute(units, units.id);
