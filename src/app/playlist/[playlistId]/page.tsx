"use client";

import { api } from "@/trpc/react";
import {
  ErrorMessage,
  LoadingMessage,
  SinglePlaylistWithVideo,
} from "@/components";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const PlaylistPage = ({ params }: { params: { playlistId: string } }) => {
  const { data, isLoading, error } = api.playlist.getPlaylistById.useQuery(
    params.playlistId,
  );

  const playlist = data?.playlist;
  const videos = data?.videos;
  const authors = data?.authors;
  const user = data?.user;

  useDocumentTitle({
    title: `${playlist?.title ?? "YourTube"}`,
    description: `${playlist?.description ?? "YourTube"}`,
  });

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage small count={5} />;
    } else if (error ?? !data) {
      return (
        <ErrorMessage
          icon="Play"
          message="Playlist not found"
          description="Sorry there is no playlist found"
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {!data ?? error ? (
        <Error />
      ) : (
        <SinglePlaylistWithVideo
          playlist={{
            id: playlist?.id ?? "",
            title: playlist?.title ?? "",
            description: playlist?.description ?? "",
            videoCount: videos?.length ?? 0,
            createdAt: playlist?.createdAt ?? new Date(),
            playlistThumbnail: videos?.[0]?.thumbnailUrl ?? "",
          }}
          videos={
            videos?.map((video) => ({
              id: video?.id ?? "",
              title: video?.title ?? "",
              videoUrl: video?.videoUrl ?? "",
              createdAt: video?.createdAt ?? new Date(),
              thumbnailUrl: video?.thumbnailUrl ?? "",
              views: video?.views ?? 0,
            })) ?? []
          }
          authors={
            authors?.map((author) => ({
              id: author?.id ?? "",
              name: author?.name ?? "",
              image: author?.image ?? "",
            })) ?? []
          }
          user={{
            id: user?.id ?? "",
            image: user?.image ?? "",
            name: user?.name ?? "",
            followers: user?.followers ?? 0,
          }}
        />
      )}
    </>
  );
};

export default PlaylistPage;
