import { Skeleton } from "@/components/ui/skeleton";

export const HeaderSkeleton = () => {
  return (
    <div className="flex items-center w-full justify-between mb-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );
};

export const UnitSkeleton = () => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex items-center gap-x-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const UserProgressSkeleton = () => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
};

export const StickyWrapperSkeleton = () => {
  return (
    <div className="hidden lg:block w-[368px] sticky self-end bottom-6">
      <div className="flex flex-col gap-y-4">
        <UserProgressSkeleton />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  );
};
