"use client";

import { refillHearts } from "@/actions/user-progress";
import {
  purchaseSubscription,
  getSubscriptionPlans,
} from "@/actions/user-subscription";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

const POINTS_TO_REFILL = 10;

export const Items = ({ hearts, points, hasActiveSubscription }: Props) => {
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
        <Image src="/heart.svg" alt="Heart" height={60} width={60} />
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
              <Image src="/points.svg" alt="Points" height={20} width={20} />
              <p>{POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>

      {/* Monthly Plan */}
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <Image src="/unlimited.svg" alt="Monthly" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Monthly Plan
          </p>
          <p className="text-neutral-500 text-sm">
            5,000 points, valid for 30 days
          </p>
        </div>
        <Button onClick={() => onUpgrade('MONTHLY')} disabled={pending || hasActiveSubscription}>
          {hasActiveSubscription ? "Subscribed" : "Purchase"}
        </Button>
      </div>

      {/* Yearly Plan */}
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/unlimited.svg" alt="Yearly" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Yearly Plan
          </p>
          <p className="text-neutral-500 text-sm">
            30,000 points, valid for 1 year
          </p>
        </div>
        <Button onClick={() => onUpgrade('YEARLY')} disabled={pending || hasActiveSubscription}>
          {hasActiveSubscription ? "Subscribed" : "Purchase"}
        </Button>
      </div>

      {/* Lifetime Plan */}
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/unlimited.svg" alt="Lifetime" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Lifetime Plan
          </p>
          <p className="text-neutral-500 text-sm">
            99,999 points, valid forever
          </p>
        </div>
        <Button onClick={() => onUpgrade('LIFETIME')} disabled={pending || hasActiveSubscription}>
          {hasActiveSubscription ? "Subscribed" : "Purchase"}
        </Button>
      </div>
    </ul>
  );
};
