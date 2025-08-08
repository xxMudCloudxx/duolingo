import "dotenv/config";

import * as schema from "../db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema: schema });

const main = async () => {
  try {
    console.log("Seeding database");
    await db.delete(schema.userProgress);
    await db.delete(schema.courses);

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Chinese",
        imgSrc: "/cn.svg",
      },
      {
        id: 2,
        title: "French",
        imgSrc: "/fr.svg",
      },
      {
        id: 3,
        title: "Spanish",
        imgSrc: "/cs.svg",
      },
      {
        id: 4,
        title: "Italian",
        imgSrc: "/it.svg",
      },
    ]);

    console.log("Seeding finished");
  } catch (error) {
    console.error(error);
    throw new Error(`Seeding Error:${error}`);
  }
};

main();
