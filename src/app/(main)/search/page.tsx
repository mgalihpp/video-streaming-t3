"use client";

import { ErrorMessage } from "@/components/ErrorMessage";
import { Skeleton } from "@/components/ui/skeleton";
import { SmallSingleColumnVideo } from "@/components/video/SmallSingleColumnVideo";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchQuery = useSearchParams().get("q");

  const { data, isLoading, error, isFetched } =
    api.video.getVideoBySearch.useQuery({
      title: searchQuery ?? "",
    });

  return (
    <>
      {isFetched && (error ?? (data && data.videos.length <= 0)) ? (
        <ErrorMessage
          icon="Play"
          message="No Video found"
          description={`No video found with query ${searchQuery}`}
        />
      ) : (
        <div className="w-fill max-w-xl">
          {isLoading
            ? Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="mb-4 flex flex-col gap-2 lg:flex-row"
                >
                  <Skeleton className="h-36 lg:w-1/2" />
                  <div className="flex flex-col gap-2 lg:w-1/2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            : data && (
                <SmallSingleColumnVideo
                  videos={data.videos}
                  users={data.videos.map((video) => video.user)}
                />
              )}
        </div>
      )}
    </>
  );
}
