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

const LearnPage = async () => {
  const userProgressPromiseData = getUserProgress();
  const unitsPromiseData = getUnits();
  const courseProgressPromiseData = getCourseProgress();
  const lessonPercentagePromiseData = getLessonPercentage();
  const userSubscriptionPromiseData = getUserSubscription();

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
  ] = await Promise.all([
    userProgressPromiseData,
    unitsPromiseData,
    courseProgressPromiseData,
    lessonPercentagePromiseData,
    userSubscriptionPromiseData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  if (!courseProgress) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
        {!isPro && <Promo />}
      </StickyWrapper>
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
    </div>
  );
};

export default LearnPage;
