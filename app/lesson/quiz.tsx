"use client";

import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { useEffect, useRef, useState } from "react";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { toast } from "sonner";
import { reduceHearts } from "@/actions/user-progress";
import { useAudio, useWindowSize, useMount } from "react-use";
import Image from "next/image";
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";
import { languageCode } from "@/constants";
type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  };
  languageCode: languageCode;
};

export const Quiz = ({
  initialHearts,
  initialLessonChallenges,
  initialLessonId,
  initialPercentage,
  userSubscription,
  languageCode,
}: Props) => {
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
  });

  const { width, height } = useWindowSize();
  const [correctAudio, , correctControls] = useAudio({
    src: "/audio/common/correct.wav",
  });
  const [finishAudio, , finishControls] = useAudio({
    src: "/audio/common/finish.mp3",
  });
  const [incorrectAudio, , incorrectControls] = useAudio({
    src: "/audio/common/incorrect.wav",
  });

  const router = useRouter();

  const [hearts, setHearts] = useState(initialHearts);
  const [lessonId] = useState(initialLessonId);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompeletedIndex = challenges.findIndex(
      (challenge) => !challenge.completed,
    );
    return uncompeletedIndex === -1 ? 0 : uncompeletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  // 追踪当前用户正在看的题目，用于异步回调判断是否还在同一题
  const activeChallengeRef = useRef<number | undefined>(undefined);

  const challenge = challenges[activeIndex];
  activeChallengeRef.current = challenge?.id;
  const options = challenge?.challengeOptions ?? [];

  useEffect(() => {
    // 只有当 challenge 不存在时 (即课程结束时) 才播放音效
    if (!challenge) {
      finishControls.play();
    }
  }, [challenge, finishControls]);

  if (!challenge) {
    return (
      <>
        {finishAudio}
        {correctAudio}
        {incorrectAudio}
        <Confetti
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
          height={height}
          width={width}
        />
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/icons/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/icons/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Great job! <br /> You&lsquo;ve completed the lesson
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard variant="points" value={challenges.length * 10} />
            <ResultCard variant="hearts" value={hearts} />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }
  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    // 捕获当前题目 ID，用于异步回调中判断用户是否还在同一题
    const currentChallengeId = challenge.id;

    if (correctOption.id === selectedOption) {
      // 立即更新 UI（乐观）
      correctControls.play();
      setStatus("correct");
      setPercentage((prev) => prev + 100 / challenges.length);

      // 练习模式下恢复红心
      if (initialPercentage === 100) {
        setHearts((prev) => Math.min(prev + 1, 5));
      }

      // 后台同步服务端
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      upsertChallengeProgress(challenge.id, userTimezone)
        .then((response) => {
          if (response?.error === "hearts") {
            // 服务端判定红心不足 → 回滚乐观状态
            // 只有用户还在同一题时才回滚 status，避免篡改下一题的状态
            if (activeChallengeRef.current === currentChallengeId) {
              setStatus("none");
              setSelectedOption(undefined);
            }
            setPercentage((prev) => prev - 100 / challenges.length);
            if (initialPercentage === 100) {
              setHearts((prev) => Math.max(prev - 1, 0));
            }
            openHeartsModal();
          }
        })
        .catch(() => {
          // 服务端异常 → 回滚乐观状态
          if (activeChallengeRef.current === currentChallengeId) {
            setStatus("none");
            setSelectedOption(undefined);
          }
          setPercentage((prev) => prev - 100 / challenges.length);
          if (initialPercentage === 100) {
            setHearts((prev) => Math.max(prev - 1, 0));
          }
          toast.error("提交失败，请重试");
        });
    } else {
      // 立即更新 UI（乐观）
      incorrectControls.play();
      setStatus("wrong");

      if (!userSubscription?.isActive && initialPercentage !== 100) {
        setHearts((prev) => Math.max(prev - 1, 0));
      }

      // 后台同步服务端
      reduceHearts(challenge.id)
        .then((response) => {
          if (response?.error === "hearts") {
            // 真实红心已经是 0 → 打开红心不足弹窗
            setHearts(0);
            openHeartsModal();
          } else if (
            response?.error === "practice" ||
            response?.error === "subscription"
          ) {
            // 服务端没有扣减红心 → 撤销乐观扣减
            setHearts((prev) => Math.min(prev + 1, 5));
          }
        })
        .catch(() => {
          // 服务端异常 → 撤销乐观红心扣减
          if (!userSubscription?.isActive) {
            setHearts((prev) => Math.min(prev + 1, 5));
          }
          toast.error("提交失败，请重试");
        });
    }
  };

  return (
    <>
      {correctAudio}
      {incorrectAudio}
      {finishAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bond text-neutral-700">
              {title}
            </h1>
            <div>
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={status !== "none"}
                type={challenge.type}
                languageCode={languageCode}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer disabled={!selectedOption} status={status} onCheck={onContinue} />
    </>
  );
};
