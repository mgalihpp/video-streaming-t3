"use client";

import { ErrorMessage } from "@/components/ErrorMessage";
import {
  MultiColumnVideo,
  MultiColumnVideoSkeleton,
} from "@/components/video/MultiColumnVideo";
import { api } from "@/trpc/react";

export default function ChannelPage({
  params,
}: {
  params: { userId: string };
}) {
  const { data: userVideos, isLoading } = api.video.getVideoByUserId.useQuery(
    params.userId,
  );

  return (
    <>
      {isLoading ? (
        <MultiColumnVideoSkeleton />
      ) : userVideos && userVideos.length <= 0 ? (
        <ErrorMessage
          icon="Play"
          message="No videos"
          description="I think this user has not uploaded any videos yet."
        />
      ) : (
        userVideos && (
          <MultiColumnVideo
            videos={userVideos}
            users={userVideos.map((video) => ({
              name: video.user.name,
              image: video.user.image,
            }))}
          />
        )
      )}
    </>
  );
}
