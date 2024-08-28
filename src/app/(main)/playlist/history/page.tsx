"use client";

import { api } from "@/trpc/react";
import { SinglePlaylistColumn } from "../_components/SinglePlaylistColumn";
import { PlaylistLoading } from "../_components/PlaylistLoading";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function PlaylistHistoryPage() {
  const {
    data: playlistData,
    isLoading,
    error,
  } = api.playlist.getPlaylistsByTitle.useQuery({
    title: "History",
  });

  return (
    <>
      {isLoading ? (
        <PlaylistLoading />
      ) : (error ?? !playlistData) ? (
        <ErrorMessage
          icon="Play"
          message="Playlist not found"
          description="Sorry there is no playlist found"
        />
      ) : (
        <SinglePlaylistColumn
          playlist={{
            id: playlistData.id ?? "",
            createdAt: playlistData.createdAt ?? "",
            description: playlistData.description ?? "",
            playlistThumbnail:
              playlistData.PlaylistHasVideo[0]?.thumbnailUrl ?? "",
            title: playlistData.title,
            videoCount: playlistData.PlaylistHasVideo.length ?? 0,
          }}
          user={playlistData.user}
          videos={playlistData.PlaylistHasVideo.map((video, index) => ({
            id: video.id ?? "",
            title: video.title ?? "",
            thumbnailUrl: video.thumbnailUrl ?? "",
            videoUrl: video.videoUrl ?? "",
            createdAt: video.createdAt ?? new Date(),
            views: video.views ?? 0,
            user: {
              name: video.user?.name ?? "",
              image: video.user?.image ?? "",
            },
            start: index,
          }))}
        />
      )}
    </>
  );
}
