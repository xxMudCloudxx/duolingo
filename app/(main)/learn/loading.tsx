import { FeedWrapper } from "@/components/feed-wrapper";
import {
  HeaderSkeleton,
  StickyWrapperSkeleton,
  UnitSkeleton,
} from "@/components/skeletons";

const Loading = () => {
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapperSkeleton />
      <FeedWrapper>
        <HeaderSkeleton />
        <UnitSkeleton />
        <UnitSkeleton />
      </FeedWrapper>
    </div>
  );
};

export default Loading;
