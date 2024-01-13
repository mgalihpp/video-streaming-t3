"use client";

import {
  Wrapper,
  LoadingMessage,
  ErrorMessage,
  SingleColumnVideo,
} from "@/components";
import { api } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const query = useSearchParams().get("q");

  const { data, isLoading, error } = api.video.getVideoBySearch.useQuery(query!);

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error ?? data?.videos.length === 0) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Videos"
          description="Sorry there is no videos for this query"
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <SessionProvider>
      <Wrapper closeSidebar={false}>
        {data?.videos.length === 0 ?? error ? (
          <Error />
        ) : (
          <>
            <SingleColumnVideo
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
    </SessionProvider>
  );
}
