import { Skeleton } from "@/components/ui/skeleton";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapperSkeleton } from "@/components/skeletons";

const Loading = () => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapperSkeleton />
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Skeleton className="h-12 w-56 mb-8" />
          <div className="space-y-2 w-full">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex items-center w-full p-2 px-4 rounded-xl hover:bg-gray-200/50"
              >
                <Skeleton className="h-8 w-12 mr-4" />
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 flex-1 ml-4" />
              </div>
            ))}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default Loading;
