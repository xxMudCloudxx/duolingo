import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imgSrc: text("image_src").notNull(),
});

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImgSrc: text("user_image_src").notNull().default("/icons/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, {
      onDelete: "cascade",
    })
    .notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, {
      onDelete: "cascade",
    })
    .notNull(),
  order: integer("order").notNull(),
});

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, {
      onDelete: "cascade",
    })
    .notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
});

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imgSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const subscriptionTypeEnum = pgEnum("subscription_type", [
  "MONTHLY",
  "YEARLY",
  "LIFETIME",
]);

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  subscriptionType: subscriptionTypeEnum("subscription_type").notNull(),
  points: integer("points").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const audioCache = pgTable("audio_cache", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  languageCode: text("language_code").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  value: integer("value").notNull(),
});

export const userDailyQuests = pgTable(
  "user_daily_quests",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    questId: integer("quest_id")
      .references(() => quests.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean("completed").notNull().default(false),
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
    // 日历日期，用于确保每个用户每天只分配一个任务
    assignedDate: date("assigned_date")
      .notNull()
      .default(sql`CURRENT_DATE`),
  },
  (t) => ({
    // 确保每个用户每天只分配一个任务
    uqUserQuestPerDay: uniqueIndex("uq_udq_user_quest_day").on(
      t.userId,
      t.questId,
      t.assignedDate
    ),
    // 加速按用户和分配时间的查询
    idxUserAssignedAt: index("idx_udq_user_assigned_at").on(
      t.userId,
      t.assignedAt
    ),
  })
);

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengesOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

export const challengesProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

export const questsRelations = relations(quests, ({ many }) => ({
  userDailyQuests: many(userDailyQuests),
}));

export const userDailyQuestsRelations = relations(
  userDailyQuests,
  ({ one }) => ({
    quest: one(quests, {
      fields: [userDailyQuests.questId],
      references: [quests.id],
    }),
  })
);
