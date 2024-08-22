"use client";

import { ErrorMessage } from "@/components/ErrorMessage";
import {
  MultiColumnVideo,
  MultiColumnVideoSkeleton,
} from "@/components/video/MultiColumnVideo";
import { api } from "@/trpc/react";
import { useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";

export default function Home() {
  const lastPostRef = useRef<HTMLDivElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    rootMargin: "40px",
    threshold: 0.9,
  });

  const {
    data: randomVideoData,
    isLoading: isRandomVideoDataLoading,
    error: isDataError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = api.video.getInfiniteVideos.useInfiniteQuery(
    {
      limit: 9, // 6 or 9 or 12
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    },
  );

  const videos = randomVideoData?.pages.flatMap((page) => page.videos) ?? [];

  useEffect(() => {
    if (entry?.isIntersecting) {
      void fetchNextPage();
    }
  }, [entry?.isIntersecting, fetchNextPage]);

  return (
    <>
      {isRandomVideoDataLoading ? (
        <MultiColumnVideoSkeleton />
      ) : (isDataError ?? !videos) ? (
        <ErrorMessage
          icon="Play"
          message="No videos"
          description="Something went wrong. Please try again later."
        />
      ) : videos.length <= 0 ? (
        <ErrorMessage
          icon="Play"
          message="No videos"
          description="Sorry we can't find any videos"
        />
      ) : (
        <>
          <MultiColumnVideo
            videos={videos.map((video) => ({
              id: video?.id ?? "",
              title: video?.title ?? "",
              thumbnailUrl: video?.thumbnailUrl ?? "",
              createdAt: video?.createdAt ?? new Date(),
              views: video?.views ?? 0,
            }))}
            users={videos.map((user) => ({
              name: user?.user.name ?? "",
              image: user?.user.image ?? "",
            }))}
          />

          {isFetchingNextPage && <MultiColumnVideoSkeleton className="mt-2" />}
          {hasNextPage && <div ref={ref}></div>}
        </>
      )}
    </>
  );
}
