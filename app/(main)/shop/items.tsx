"use client";

import { refillHearts } from "@/actions/user-progress";
import { purchaseSubscription } from "@/actions/user-subscription";
import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL, SUBSCRIPTION_PLANS } from "@/constants";
import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  isLifeTime: boolean;
};

export const Items = ({
  hearts,
  points,
  hasActiveSubscription,
  isLifeTime,
}: Props) => {
  const [pending, startTransition] = useTransition();

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) {
      return;
    }

    startTransition(() => {
      refillHearts().catch(() => toast("something went wrong"));
    });
  };

  const onUpgrade = (planType: "MONTHLY" | "YEARLY" | "LIFETIME") => {
    startTransition(() => {
      purchaseSubscription(planType)
        .then((response) => {
          if (response.success) {
            toast.success(response.message);
          }
        })
        .catch((error) => toast.error(error.message || "Purchase failed"));
    });
  };
  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/icons/heart.svg" alt="Heart" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Refill hearts
          </p>
        </div>
        <Button
          disabled={hearts === 5 || points < POINTS_TO_REFILL || pending}
          onClick={onRefillHearts}
        >
          {hearts === 5 ? (
            "full"
          ) : (
            <div className="flex items-center">
              <Image src="/icons/points.svg" alt="Points" height={20} width={20} />
              <p>{POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>
      {Object.values(SUBSCRIPTION_PLANS).map((plan, index) => (
        <div
          key={`${index}-${plan.name}`}
          className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2"
        >
          <Image src="/icons/unlimited.svg" alt="Monthly" height={60} width={60} />
          <div className="flex-1">
            <p className="text-neutral-700 text-base lg:text-xl font-bold">
              {plan.name}
            </p>
            <p className="text-neutral-500 text-sm">{plan.description}</p>
          </div>
          <Button
            onClick={() => onUpgrade(plan.type)}
            disabled={pending || points < plan.points || isLifeTime}
          >
            {hasActiveSubscription ? "Extend" : "Purchase"}
          </Button>
        </div>
      ))}
    </ul>
  );
};
