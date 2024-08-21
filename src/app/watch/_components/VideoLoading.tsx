import { Skeleton } from "@/components/ui/skeleton";

export const VideoLoading = () => {
  return (
    <div className="space-y-2">
      {/* VIDEO PLAYER LOADING */}
      <Skeleton className="h-96 w-full" />

      {/* VIDEO INFO LOADING */}
      <div className="flex space-x-3 rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-secondary">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="w-full">
            <div className="flex flex-col items-start justify-center gap-1 self-stretch">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2">
            <div className="flex w-1/2 flex-row items-center gap-2">
              <Skeleton className="size-9 max-h-9 max-w-9 rounded-full" />
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />

              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>

          <div className="rounded-md bg-muted p-2">
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>

      {/* VIDEO COMMENT SECTION LOADING */}
      <Skeleton className="h-96 w-full" />
    </div>
  );
};
