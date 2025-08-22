import { Skeleton } from "@/components/ui/skeleton";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapperSkeleton } from "@/components/skeletons";

const Loading = () => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapperSkeleton />
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="space-y-4 w-full">
            <Skeleton className="w-full h-24 rounded-xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default Loading;
