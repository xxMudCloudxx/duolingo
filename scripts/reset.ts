import "dotenv/config";

import * as schema from "../db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema: schema });

const main = async () => {
  try {
    console.log("resetting database");
    await db.delete(schema.userProgress);
    await db.delete(schema.courses);
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);

    // finished
    console.log("resetting finished");
  } catch (error) {
    console.error(error);
    throw new Error(`resetting Error:${error}`);
  }
};

main();
