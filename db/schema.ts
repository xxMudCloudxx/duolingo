import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imgSrc: text("image_src").notNull(),
});

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImgSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  coursesId: integer("courses_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  description: text("description").notNull(),
  order: integer("order").notNull(),
});

export const lessions = pgTable("lessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "cascade",
  }),
  description: text("description").notNull(),
  order: integer("order").notNull(),
});

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessionsId: integer("lessions_id").references(() => lessions.id, {
    onDelete: "cascade",
  }),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
});

export const challengesOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imgSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengesProgress = pgTable("challenges_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});
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
    fields: [units.coursesId],
    references: [courses.id],
  }),
  lessions: many(lessions),
}));

export const lessionsRelations = relations(lessions, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessions.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lessions: one(lessions, {
    fields: [challenges.lessionsId],
    references: [lessions.id],
  }),
  challengesOptions: many(challengesOptions),
  challengesProgress: many(challengesProgress),
}));

export const challengesOptionsRelations = relations(
  challengesOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengesOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

export const challengesProgressRelations = relations(
  challengesProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengesProgress.challengeId],
      references: [challenges.id],
    }),
  })
);
