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
    await db.delete(schema.units);
    await db.delete(schema.lessons);
    await db.delete(schema.challenges);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);

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
        imgSrc: "/es.svg",
      },
      {
        id: 4,
        title: "Italian",
        imgSrc: "/it.svg",
      },
    ]);

    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 3, // Spanish
        title: "Unit 1",
        description: "Learn the basics of Spanish",
        order: 1,
      },
    ]);

    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1, // Unit 1 (Learn the basics...)
        title: "Nouns",
        order: 1,
      },
      {
        id: 2,
        unitId: 1, // Unit 1 (Learn the basics...)
        title: "Verbs",
        order: 2,
      },
      {
        id: 3,
        unitId: 1, // Unit 1 (Learn the basics...)
        title: "Verbs2",
        order: 3,
      },
      {
        id: 4,
        unitId: 1, // Unit 1 (Learn the basics...)
        title: "Verbs3",
        order: 3,
      },
      {
        id: 5,
        unitId: 1, // Unit 1 (Learn the basics...)
        title: "Verbs4",
        order: 3,
      },
    ]);

    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1, //Nouns
        type: "SELECT",
        order: 1,
        question: `Which one of these is the "the man"?`,
      },
      {
        id: 2,
        lessonId: 1, //Nouns
        type: "ASSIST",
        order: 1,
        question: `"the man"`,
      },
      {
        id: 3,
        lessonId: 1, //Nouns
        type: "SELECT",
        order: 1,
        question: `Which one of these is the "the man"?`,
      },
    ]);

    await db.insert(schema.challengeOptions).values([
      {
        id: 1,
        challengeId: 1,
        imgSrc: "/man.svg",
        correct: true,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        id: 2,
        challengeId: 1,
        imgSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        id: 3,
        challengeId: 1,
        imgSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        id: 4,
        challengeId: 2,
        imgSrc: "/man.svg",
        correct: true,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        id: 5,
        challengeId: 2,
        imgSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        id: 6,
        challengeId: 2,
        imgSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
    ]);
    await db.insert(schema.challengeOptions).values([
      {
        id: 7,
        challengeId: 3,
        imgSrc: "/man.svg",
        correct: true,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        id: 8,
        challengeId: 3,
        imgSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        id: 9,
        challengeId: 3,
        imgSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
    ]);

    await db.insert(schema.challenges).values([
      {
        id: 4,
        lessonId: 2, // Verbs
        type: "SELECT",
        order: 1,
        question: `Which one of these is the "the man"?`,
      },
      {
        id: 5,
        lessonId: 2, // Verbs
        type: "ASSIST",
        order: 2,
        question: `"the man"`,
      },
      {
        id: 6,
        lessonId: 2, // Verbs
        type: "SELECT",
        order: 3,
        question: `Which one of these is the "the man"?`,
      },
    ]);

    // finished
    console.log("Seeding finished");
  } catch (error) {
    console.error(error);
    throw new Error(`Seeding Error:${error}`);
  }
};

main();
