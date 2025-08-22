import {
  courses as dbCourses,
  lessons as dbLessons,
  units as dbUnits,
  challenges as dbChallenges,
} from "@/db/schema";
import { FilterList, FilterListItem } from "react-admin";

// --- 类型定义 ---
interface FilterValue {
  courseId?: number;
  unitId?: number;
  lessonId?: number;
  challengeId?: number;
}

interface FilterState {
  courseIds?: number[];
  unitIds?: number[];
  lessonIds?: number[];
  challengeIds?: number[];
}

export type coursesType = (typeof dbCourses.$inferSelect)[];
export type lessonsType = (typeof dbLessons.$inferSelect)[];
export type unitsType = (typeof dbUnits.$inferSelect)[];
export type challengesType = (typeof dbChallenges.$inferSelect)[];
// --- 核心逻辑：定义筛选状态的检查与更新函数 ---
// 1. Course 筛选逻辑
const isCourseSelected = (
  value: FilterValue,
  filters: FilterState
): boolean => {
  // 检查当前项的 courseId 是否在全局 filters 的 courseIds 数组中
  return (filters.courseIds || []).includes(value.courseId!);
};

const toggleCourseFilter = (
  value: FilterValue,
  filters: FilterState
): FilterState => {
  const courseIds = filters.courseIds || [];
  const newCourseIds = courseIds.includes(value.courseId!)
    ? courseIds.filter((id) => id !== value.courseId!) // 已选 -> 移除
    : [...courseIds, value.courseId!]; // 未选 -> 添加

  const newFilters = { ...filters, courseIds: newCourseIds };

  // 如果清空了所有课程选择，则删除子级筛选
  if (newCourseIds.length === 0) {
    delete newFilters.unitIds;
    delete newFilters.lessonIds;
  }

  // 返回新的筛选对象，react-admin 会自动用它来更新状态
  return newFilters;
};

// 2. Unit 筛选逻辑
const isUnitSelected = (value: FilterValue, filters: FilterState): boolean => {
  return (filters.unitIds || []).includes(value.unitId!);
};

const toggleUnitFilter = (
  value: FilterValue,
  filters: FilterState
): FilterState => {
  const unitIds = filters.unitIds || [];
  const newUnitIds = unitIds.includes(value.unitId!)
    ? unitIds.filter((id) => id !== value.unitId!)
    : [...unitIds, value.unitId!];

  const newFilters = { ...filters, unitIds: newUnitIds };

  if (newUnitIds.length === 0) {
    delete newFilters.lessonIds;
  }
  return newFilters;
};

// 3. Lesson 筛选逻辑
const isLessonSelected = (
  value: FilterValue,
  filters: FilterState
): boolean => {
  return (filters.lessonIds || []).includes(value.lessonId!);
};

const toggleLessonFilter = (
  value: FilterValue,
  filters: FilterState
): FilterState => {
  const lessonIds = filters.lessonIds || [];
  const newLessonIds = lessonIds.includes(value.lessonId!)
    ? lessonIds.filter((id) => id !== value.lessonId!)
    : [...lessonIds, value.lessonId!];

  const newFilters = { ...filters, lessonIds: newLessonIds };

  if (newLessonIds.length === 0) {
    delete newFilters.challengeIds;
  }
  return newFilters;
};

// 4. Challenge 筛选逻辑
const isChallengeSelected = (
  value: FilterValue,
  filters: FilterState
): boolean => {
  return (filters.challengeIds || []).includes(value.challengeId!);
};

const toggleChallengeFilter = (
  value: FilterValue,
  filters: FilterState
): FilterState => {
  const challengeIds = filters.challengeIds || [];
  const newChallengeIds = challengeIds.includes(value.challengeId!)
    ? challengeIds.filter((id) => id !== value.challengeId!)
    : [...challengeIds, value.challengeId!];

  return { ...filters, challengeIds: newChallengeIds };
};

export const CoursesFilterList = ({ courses }: { courses: coursesType }) => {
  if (!courses) return;
  return (
    <FilterList label="Course" icon={null}>
      {courses?.map((course) => (
        <FilterListItem
          key={course.id}
          label={course.title}
          value={{ courseId: course.id }}
          isSelected={isCourseSelected}
          toggleFilter={toggleCourseFilter}
        />
      ))}
    </FilterList>
  );
};

export const UnitsFilterList = ({ units }: { units: unitsType }) => {
  if (!units) return;
  return (
    <FilterList label="Unit" icon={null}>
      {units?.map((unit) => (
        <FilterListItem
          key={unit.id}
          label={unit.title}
          value={{ unitId: unit.id }}
          isSelected={isUnitSelected}
          toggleFilter={toggleUnitFilter}
        />
      ))}
    </FilterList>
  );
};

export const LessonsFilterList = ({ lessons }: { lessons: lessonsType }) => {
  if (!lessons) return;
  return (
    <FilterList label="Lesson" icon={null}>
      {lessons?.map((lesson) => (
        <FilterListItem
          key={lesson.id}
          label={lesson.title}
          value={{ lessonId: lesson.id }}
          isSelected={isLessonSelected}
          toggleFilter={toggleLessonFilter}
        />
      ))}
    </FilterList>
  );
};

export const ChallengesFilterList = ({
  challenges,
}: {
  challenges: challengesType;
}) => {
  if (!challenges) return;
  return (
    <FilterList label="Challenges" icon={null}>
      {/* <FilterListItem
              label="All"
              value={{ ...filterValues, challengeIds: [] }}
            /> */}
      {challenges?.map((challenge) => (
        <FilterListItem
          key={challenge.id}
          label={challenge.question}
          value={{
            challengeId: challenge.id,
          }}
          isSelected={isChallengeSelected}
          toggleFilter={toggleChallengeFilter}
        />
      ))}
    </FilterList>
  );
};
