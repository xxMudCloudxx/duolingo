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
          <div className="space-y-8 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center w-full gap-x-4">
                <Skeleton className="h-16 w-16" />
                <div className="w-full space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default Loading;
