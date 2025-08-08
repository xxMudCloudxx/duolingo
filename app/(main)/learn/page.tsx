import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";

const LearnPage = async () => {
  const userProgressPromiseData = getUserProgress();

  const [userProgress] = await Promise.all([userProgressPromiseData]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const activeCourse = userProgress?.activeCourse;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={{
            title: activeCourse.title,
            imgSrc: activeCourse.imgSrc,
            id: activeCourse.id,
          }}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={activeCourse.title} />
      </FeedWrapper>
    </div>
  );
};

export default LearnPage;
