import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <Skeleton className="h-12 w-56 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-y-2">
            <Skeleton className="h-[217px] w-full rounded-xl" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
