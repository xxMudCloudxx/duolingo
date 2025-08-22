import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col h-full w-full px-6">
      {/* Header Skeleton */}
      <div className="flex items-center w-full justify-between p-4 border-b shrink-0">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-1/3 max-w-sm" />
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-8" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-y-12 w-full max-w-lg mx-auto">
        {/* Question Title Skeleton */}
        <Skeleton className="h-10 w-4/5 lg:w-full" />

        {/* Challenge Options Skeleton */}
        <div className="w-full space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="h-24 border-t-2 shrink-0">
        <div className="h-full w-full max-w-screen-lg mx-auto flex items-center justify-end px-6">
          <Skeleton className="h-12 w-28 rounded-xl" />
        </div>
      </footer>
    </div>
  );
};

export default Loading;
