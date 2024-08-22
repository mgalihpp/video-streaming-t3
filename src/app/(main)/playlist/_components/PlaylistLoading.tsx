import { Skeleton } from "@/components/ui/skeleton";

export const PlaylistLoading = () => {
  return (
    <div className="mx-auto gap-4 lg:flex">
      <div className="lg:w-2/3">
        <Skeleton className="h-96 w-full" />
        <div className="mt-2">
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex flex-row place-content-between gap-x-4 px-4">
          <div className="w-full">
            <div className="mt-4 flex w-full flex-row items-center gap-2">
              <Skeleton className="size-9 max-h-9 max-w-9 rounded-full" />
              <div className="flex w-full flex-col justify-center gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 border-b border-gray-200 dark:border-secondary" />
      <div className="lg:w-1/3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="mb-4 flex flex-col gap-2 lg:flex-row">
            <Skeleton className="h-28 lg:w-1/2" />
            <div className="flex flex-col gap-2 lg:w-1/2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
