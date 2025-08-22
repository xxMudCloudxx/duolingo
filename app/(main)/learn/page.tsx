import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/user-progress";
import {
  getCourseProgress,
  getLessonPercentage,
  getUnits,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";
import { redirect } from "next/navigation";
import { Unit } from "./unit";
import { lessons, units as unitsSchema } from "@/db/schema";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { Suspense } from "react";
import {
  HeaderSkeleton,
  StickyWrapperSkeleton,
  UnitSkeleton,
} from "@/components/skeletons";

// 右侧边栏的数据获取和渲染组件
const UserProgressSection = async () => {
  const userProgressPromise = getUserProgress();
  const userSubscriptionPromise = getUserSubscription();

  const [userProgress, userSubscription] = await Promise.all([
    userProgressPromise,
    userSubscriptionPromise,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <StickyWrapper>
      <UserProgress
        activeCourse={userProgress.activeCourse}
        hearts={userProgress.hearts}
        points={userProgress.points}
        hasActiveSubscription={isPro}
      />
      {!isPro && <Promo />}
      <Quests points={userProgress.points} />
    </StickyWrapper>
  );
};

// 主要内容区域的数据获取和渲染组件
const FeedSection = async () => {
  const userProgressPromise = getUserProgress();
  const unitsPromise = getUnits();
  const courseProgressPromise = getCourseProgress();
  const lessonPercentagePromise = getLessonPercentage();

  const [userProgress, units, courseProgress, lessonPercentage] =
    await Promise.all([
      userProgressPromise,
      unitsPromise,
      courseProgressPromise,
      lessonPercentagePromise,
    ]);

  if (!userProgress || !userProgress.activeCourse || !courseProgress) {
    redirect("/courses");
  }

  return (
    <FeedWrapper>
      <Header title={userProgress.activeCourse.title} />
      {units.map((unit) => (
        <Unit
          key={unit.id}
          id={unit.id}
          order={unit.order}
          description={unit.description}
          title={unit.title}
          lessons={unit.lessons}
          activeLesson={
            courseProgress.activeLesson as
              | (typeof lessons.$inferSelect & {
                  unit: typeof unitsSchema.$inferSelect;
                })
              | undefined
          }
          activeLessonPercentage={lessonPercentage}
        />
      ))}
    </FeedWrapper>
  );
};

const FeedSkeleton = () => {
  return (
    <FeedWrapper>
      <HeaderSkeleton />
      <UnitSkeleton />
      <UnitSkeleton />
    </FeedWrapper>
  );
};

const LearnPage = () => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <Suspense fallback={<StickyWrapperSkeleton />}>
        <UserProgressSection />
      </Suspense>

      <Suspense fallback={<FeedSkeleton />}>
        <FeedSection />
      </Suspense>
    </div>
  );
};

export default LearnPage;
