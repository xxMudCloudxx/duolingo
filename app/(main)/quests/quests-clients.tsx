"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";

import { getQuestsAction } from "@/actions/quests"; // 1. 【关键修正】导入 Server Action
import { Progress } from "@/components/ui/progress";
import { quests as questsSchema } from "@/db/schema";
import { formatTimeLeft, getSecondsUntilNext5AM } from "@/lib/utils";

type Quest = typeof questsSchema.$inferSelect & { completed: boolean };

type Props = {
  dailyPoints: number;
};

export const QuestsClient = ({ dailyPoints }: Props) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isPending, startTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // 在组件加载后，从客户端获取时区
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 更新倒计时的函数
    const updateTimer = (): void => {
      const seconds = getSecondsUntilNext5AM(userTimezone);
      setTimeLeft(formatTimeLeft(seconds));
    };

    startTransition(() => {
      getQuestsAction(userTimezone)
        .then(setQuests)
        .catch(() => toast.error("something went wrong"));
    });

    // 立即设置一次倒计时，然后每分钟更新一次
    updateTimer();
    const timerInterval = setInterval(updateTimer, 60000); // 每60秒更新

    // 组件卸载时清除定时器
    return () => clearInterval(timerInterval);
  }, []);
  if (isPending) {
    return (
      <div className="w-full space-y-4">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <ul className="w-full">
      {/* 倒计时显示 */}
      <div className="flex items-center justify-end text-sm font-bold text-neutral-500">
        <Image
          src="/icons/timer.svg"
          alt="计时器"
          width={18}
          height={18}
          className="mr-1"
        />
        {timeLeft}
      </div>
      {quests.map((quest) => {
        // 使用从父组件传入的 dailyPoints 来计算进度
        const progress = Math.min((dailyPoints / quest.value) * 100, 100);

        return (
          <div
            className="flex items-center w-full p-4 gap-x-4 border-t-2"
            key={quest.id}
          >
            <Image
              src="/icons/points.svg"
              alt="Points"
              width={60}
              height={60}
            />
            <div className="flex flex-col gap-y-2 w-full">
              <p className="text-neutral-700 text-xl font-bold">
                {quest.title}
              </p>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        );
      })}
    </ul>
  );
};
