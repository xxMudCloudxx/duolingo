import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { Quiz } from "../quiz";
type Props = {
  params: {
    lessonId: number;
  };
};
const LessonIdPage = async ({ params }: Props) => {
  const param = await params;
  const lessonId = Number(param.lessonId);
  const lessonPromiseData = getLesson(lessonId);
  const userSubscriptionPromiseData = getUserSubscription();
  const userProgressPromiseData = getUserProgress();

  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonPromiseData,
    userProgressPromiseData,
    userSubscriptionPromiseData,
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

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
    />
  );
};

export default LessonIdPage;
