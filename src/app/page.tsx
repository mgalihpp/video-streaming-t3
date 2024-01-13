"use client";

import {
  Wrapper,
  LoadingMessage,
  ErrorMessage,
  MultiColumnVideo,
} from "@/components";
import { api } from "@/trpc/react";

export default function Home() {
  const { data, isLoading, error } = api.video.getRandomVideo.useQuery(20);

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error ?? !data) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Videos"
          description="Sorry there is no videos at this time"
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <Wrapper closeSidebar={false}>
      {!data ?? error ? (
        <Error />
      ) : (
        <>
          <MultiColumnVideo
            videos={
              data?.videos.map((video) => ({
                id: video?.id ?? "",
                title: video?.title ?? "",
                thumbnailUrl: video?.thumbnailUrl ?? "",
                createdAt: video?.createdAt ?? new Date(),
                views: video?.views ?? 0,
              })) ?? []
            }
            users={
              data?.users.map((user) => ({
                name: user?.name ?? "",
                image: user?.image ?? "",
              })) ?? []
            }
          />
        </>
      )}
    </Wrapper>
  );
}
