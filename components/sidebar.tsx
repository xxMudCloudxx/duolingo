"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { DotIcon, Loader } from "lucide-react";
import UserProfilePage from "@/app/(marketing)/user-profile/[[...user-profile]]/page";
import { SidebarItem } from "./sidebar-item";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  return (
    <div
      className={cn(
        "h-full lg:w-[256px] lg:fixed flex left-0 top-0 px-4 border-r-2 flex-col",
        className
      )}
    >
      <Link href={"/learn"}>
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/icons/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            Duolingo
          </h1>
        </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem label="learn" iconSrc="/icons/learn.svg" href="/learn" />
        <SidebarItem
          label="Leaderboard"
          iconSrc="/icons/leaderboard.svg"
          href="/leaderboard"
        />
        <SidebarItem
          label="quests"
          iconSrc="/icons/quests.svg"
          href="/quests"
        />
        <SidebarItem label="shop" iconSrc="/icons/shop.svg" href="/shop" />
      </div>
      <div className="p-4">
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <UserButton
            userProfileUrl="/user-profile"
            appearance={{
              elements: {
                userButtonPopoverFooter: "hidden!",
                userButtonPopoverMain: "w-[298px]!",
                userButtonPopoverCard: "w-[298px]!",
              },
            }}
          >
            <UserButton.UserProfilePage
              label="Custom Page"
              url="/user-profile"
              labelIcon={<DotIcon />}
            >
              <UserProfilePage />
            </UserButton.UserProfilePage>
          </UserButton>
        </ClerkLoaded>
      </div>
    </div>
  );
};
