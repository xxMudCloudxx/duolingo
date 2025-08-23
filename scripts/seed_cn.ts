import "dotenv/config";
import * as schema from "../db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema: schema });

const main = async () => {
  try {
    console.log("Seeding database...");

    // 1. 清空所有相关表
    await db.delete(schema.userProgress);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.courses);
    await db.delete(schema.userSubscription);
    await db.delete(schema.audioCache);

    // 2. 创建课程 (仅创建中文课程用于测试)
    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Chinese",
        imgSrc: "/flags/cn.svg",
      },
    ]);

    // 3. 创建单元
    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1, // 关联到中文课程
        title: "第一单元",
        description: "学习中文基础",
        order: 1,
      },
    ]);

    // 4. 创建课时
    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1, // 关联到第一单元
        title: "基础问候",
        order: 1,
      },
    ]);

    // 5. 创建挑战
    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1, // 关联到 "基础问候"
        type: "SELECT",
        order: 1,
        question: "哪个是“你好”？",
      },
      {
        id: 2,
        lessonId: 1, // 关联到 "基础问候"
        type: "SELECT",
        order: 2,
        question: "哪个是“谢谢”？",
      },
    ]);

    // 6. 创建挑战选项 (audioSrc 设为 null 以便 TTS 生成)
    await db.insert(schema.challengeOptions).values([
      // 挑战1的选项
      {
        id: 1,
        challengeId: 1,
        correct: true,
        text: "你好",
        audioSrc: null, // 将由 TTS 脚本生成
      },
      {
        id: 2,
        challengeId: 1,
        correct: false,
        text: "谢谢",
        audioSrc: null,
      },
      {
        id: 3,
        challengeId: 1,
        correct: false,
        text: "再见",
        audioSrc: null,
      },
      // 挑战2的选项
      {
        id: 4,
        challengeId: 2,
        correct: false,
        text: "你好",
        audioSrc: null,
      },
      {
        id: 5,
        challengeId: 2,
        correct: true,
        text: "谢谢",
        audioSrc: null,
      },
      {
        id: 6,
        challengeId: 2,
        correct: false,
        text: "再见",
        audioSrc: null,
      },
    ]);

    console.log("✅ Seeding finished successfully!");
  } catch (error) {
    console.error(error);
    throw new Error("❌ Failed to seed the database.");
  }
};

main();
