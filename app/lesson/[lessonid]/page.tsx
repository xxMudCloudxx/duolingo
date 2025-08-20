import { getLesson, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import { Quiz } from "../quiz";
type Props = {
  params: {
    lessonId: number;
  };
};
const LessonIdPage = async ({ params }: Props) => {
  const lessonPromiseData = getLesson(params.lessonId);

  const userProgressPromiseData = getUserProgress();
  const [lesson, userProgress] = await Promise.all([
    lessonPromiseData,
    userProgressPromiseData,
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
      userSubscription={null}
    />
  );
};

export default LessonIdPage;
