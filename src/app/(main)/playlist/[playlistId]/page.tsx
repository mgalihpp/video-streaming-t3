"use client";

import { api } from "@/trpc/react";
import { SinglePlaylistColumn } from "../_components/SinglePlaylistColumn";
import { ErrorMessage } from "@/components/ErrorMessage";
import { PlaylistLoading } from "../_components/PlaylistLoading";

export default function PlaylistPage({
  params,
}: {
  params: { playlistId: string };
}) {
  const {
    data: playlistData,
    isLoading,
    error,
  } = api.playlist.getPlaylistById.useQuery({ id: params.playlistId });

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
          videos={playlistData.PlaylistHasVideo.map((video) => ({
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
          }))}
        />
      )}
    </>
  );
}
