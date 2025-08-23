import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { Quiz } from "./quiz";
import { courseTitleToLangCode } from "@/constants";

const LessonPage = async () => {
  const lessonPromiseData = getLesson();
  const userProgressPromiseData = getUserProgress();
  const userSubscriptionPromiseData = getUserSubscription();
  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonPromiseData,
    userProgressPromiseData,
    userSubscriptionPromiseData,
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }
  const courseTitle = lesson.unit.course.title;
  const languageCode = courseTitleToLangCode[courseTitle];

  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      lesson.challenges.length) *
    100;

  return (
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      userSubscription={userSubscription!}
      languageCode={languageCode}
    />
  );
};

export default LessonPage;
