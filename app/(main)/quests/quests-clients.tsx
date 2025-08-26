"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";

import { getQuestsAction } from "@/actions/quests"; // 1. 【关键修正】导入 Server Action
import { Progress } from "@/components/ui/progress";
import { quests as questsSchema } from "@/db/schema";

type Quest = typeof questsSchema.$inferSelect & { completed: boolean };

type Props = {
  dailyPoints: number;
};

export const QuestsClient = ({ dailyPoints }: Props) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // 在组件加载后，从客户端获取时区
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    startTransition(() => {
      getQuestsAction(userTimezone)
        .then(setQuests)
        .catch(() => toast.error("something went wrong"));
    });
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
