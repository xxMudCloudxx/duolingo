import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import {
  getDailyProgress,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";
import Image from "next/image";
import { redirect } from "next/navigation";
import { QuestsClient } from "./quests-clients";

const QuestsPage = async () => {
  const userProgressPromiseData = getUserProgress();
  const userSubscriptionPromiseData = getUserSubscription();
  const dailyProgressPromiseData = getDailyProgress();

  const [userProgress, userSubscription, dailyProgress] = await Promise.all([
    userProgressPromiseData,
    userSubscriptionPromiseData,
    dailyProgressPromiseData,
  ]);

  const isPro = !!userSubscription?.isActive;

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && <Promo />}
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image src="/icons/quests.svg" alt="Quests" height={90} width={90} />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Daily Quests
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-3">
            Complete quests by earning points in lessons. <br />
            Practice mode does not count and quests refresh daily.
          </p>
          <QuestsClient points={dailyProgress?.points || 0} />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default QuestsPage;
