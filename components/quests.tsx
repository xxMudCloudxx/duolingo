"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { getSecondsUntilNext5AM } from "@/lib/utils";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { quests as questsSchema } from "@/db/schema";
import { getQuestsAction } from "@/actions/quests";

// 定义 Quest 类型
type Quest = typeof questsSchema.$inferSelect & { completed: boolean };

type Props = {
  points: number; // 从父组件接收的“今日分数”
};

// 格式化剩余时间的辅助函数
const formatTimeLeft = (seconds: number) => {
  if (seconds < 60) return "less than a minute left";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} left`;
  }
  return `${minutes} minute${minutes > 1 ? "s" : ""} left`;
};

export const Quests = ({ points }: Props) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // 在客户端获取用户时区
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 更新倒计时的函数
    const updateTimer = () => {
      const seconds = getSecondsUntilNext5AM(userTimezone);
      setTimeLeft(formatTimeLeft(seconds));
    };

    //  调用 Server Action 来获取任务数据
    startTransition(() => {
      getQuestsAction(userTimezone)
        .then(setQuests)
        .catch(() => toast.error("Failed to load quests. Please refresh."));
    });

    // 立即设置一次倒计时，然后每分钟更新一次
    updateTimer();
    const timerInterval = setInterval(updateTimer, 60000); // 每60秒更新

    // 组件卸载时清除定时器
    return () => clearInterval(timerInterval);
  }, []); // 空依赖数组确保只在组件加载时运行一次

  return (
    <div className="border-2 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between w-full">
        <h3 className="font-bold text-lg">Daily Quests</h3>
        <div className="flex items-center gap-x-2">
          {/* 倒计时显示 */}
          <div className="flex items-center text-sm font-bold text-neutral-500">
            <Image
              src="/icons/timer.svg"
              alt="计时器"
              width={18}
              height={18}
              className="mr-1"
            />
            {timeLeft}
          </div>
          <Link href={"/quests"}>
            <Button size="sm" variant={"primaryOutline"}>
              View
            </Button>
          </Link>
        </div>
      </div>
      {isPending ? (
        <div className="text-center text-muted-foreground pt-4">Loading...</div>
      ) : (
        <ul className="w-full space-y-4">
          {quests.map((quest) => {
            const progress = Math.min((points / quest.value) * 100, 100);

            return (
              <div
                className="flex items-center w-full p-2 gap-x-3"
                key={quest.id}
              >
                <Image
                  src="/icons/points.svg"
                  alt="Points"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col gap-y-2 w-full">
                  <p className="text-neutral-700 text-sm font-bold">
                    {quest.title}
                  </p>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
};
