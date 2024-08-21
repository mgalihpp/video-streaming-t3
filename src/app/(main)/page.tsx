"use client";

import { ErrorMessage } from "@/components/ErrorMessage";
import {
  MultiColumnVideo,
  MultiColumnVideoSkeleton,
} from "@/components/video/MultiColumnVideo";
import { api } from "@/trpc/react";

export default function Home() {
  const {
    data: randomVideoData,
    isLoading: isRandomVideoDataLoading,
    error: isDataError,
  } = api.video.getRandomVideo.useQuery({ many: 20 });

  return (
    <>
      {isRandomVideoDataLoading ? (
        <MultiColumnVideoSkeleton />
      ) : (isDataError ?? !randomVideoData) ? (
        <ErrorMessage
          icon="Play"
          message="No videos"
          description="Something went wrong. Please try again later."
        />
      ) : randomVideoData.randomVideos.length <= 0 ? (
        <ErrorMessage
          icon="Play"
          message="No videos"
          description="Sorry we can't find any videos"
        />
      ) : (
        <MultiColumnVideo
          videos={randomVideoData.randomVideos.map((video) => ({
            id: video?.id ?? "",
            title: video?.title ?? "",
            thumbnailUrl: video?.thumbnailUrl ?? "",
            createdAt: video?.createdAt ?? new Date(),
            views: video?.views ?? 0,
          }))}
          users={randomVideoData.randomVideos.map((user) => ({
            name: user?.user.name ?? "",
            image: user?.user.image ?? "",
          }))}
        />
      )}
    </>
  );
}
