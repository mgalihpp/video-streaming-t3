"use client";

import { api } from "@/trpc/react";
import MultiColumnTrenPlaylist from "../_components/MultiColumnTrenPlaylist";
import { ErrorMessage } from "@/components/ErrorMessage";
import { MultiColumnVideoSkeleton } from "@/components/video/MultiColumnVideo";

export default function FeedTrendingPage() {
  const {
    data: TrendingVideoData,
    isLoading,
    error,
  } = api.video.getTrendingVideos.useQuery();

  return (
    <>
      {isLoading ? (
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Trending Playlists</h1>
            <p className="text-muted-foreground">
              Discover the latest and greatest videos on our platform.
            </p>
          </div>

          <MultiColumnVideoSkeleton />
        </div>
      ) : (error ?? !TrendingVideoData) ? (
        <ErrorMessage
          icon="Horn"
          message="No Trending Videos"
          description="Sorry we can't find any trending videos"
        />
      ) : (
        <MultiColumnTrenPlaylist
          videos={TrendingVideoData?.map((video) => ({
            id: video.id ?? "",
            thumbnailUrl: video.thumbnailUrl ?? "",
            title: video.title ?? "",
            createdAt: video.createdAt ?? "",
            views: video.views ?? 0,
          }))}
          users={TrendingVideoData?.map((video) => ({
            name: video.user?.name ?? "",
            image: video.user?.image ?? "",
          }))}
        />
      )}
    </>
  );
}
