"use client";

import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { VideoPlayer } from "../_components/VideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoInfo } from "@/components/video/VideoInfo";
import { VideoTitle } from "@/components/video/VIdeoTitle";
import { UserImage } from "@/components/video/VideoUserImage";
import { VideoUserName } from "@/components/video/VideoUsername";
import Link from "next/link";
import LikeDislikeButton from "@/components/button/LikeDislikeButton";
import FollowButton from "@/components/button/FollowButton";
import SaveButton from "@/components/button/SaveButton";
import { useEffect, useMemo } from "react";
import { SmallSingleColumnVideo } from "@/components/video/SmallSingleColumnVideo";
import { VideoComment } from "@/components/video/VideoComment";
import { VideoLoading } from "./VideoLoading";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function Video() {
  const videoId = useSearchParams().get("video");
  const { data: session } = useSession();

  const {
    data: videoData,
    isLoading: isVideoLoading,
    isFetched: isVideoFetched,
    error: isVideoError, // unused cause of server side call
    refetch: refetchVideo,
  } = api.video.getVideobyId.useQuery(
    { id: videoId!, viewerId: session?.user.id },
    {
      enabled: !!videoId && !!session?.user.id,
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  const { data: RandomVideoData, isLoading: isRandomVideoLoading } =
    api.video.getRandomVideo.useQuery(
      {
        many: 10,
        excludedVideoId: videoId ?? "",
      },
      {
        enabled: !!videoId && !!videoData,
        refetchOnWindowFocus: false,
      },
    );

  const { mutateAsync: addViewCount } =
    api.videoEngagement.addViewCount.useMutation();

  useEffect(() => {
    if (videoId && videoData?.video.id) {
      addViewCount({
        id: videoData.video.id,
      }).catch((error) => {
        console.log(error);
      });
    }
  }, [videoId, videoData?.video.id, addViewCount]);

  const options = useMemo(
    () => ({
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [
        {
          src: videoData?.video.videoUrl,
          type: "application/x-mpegURL",
        },
      ],
      html5: {
        vhs: {
          withCredentials: false,
        },
      },
      poster: videoData?.video.thumbnailUrl ?? "",
      spriteThumbnails: videoData?.video.spriteThumbnails ?? [],
    }),
    [
      videoData?.video.videoUrl,
      videoData?.video.thumbnailUrl,
      videoData?.video.spriteThumbnails,
    ],
  );

  if (isVideoFetched && !videoData) {
    return (
      <ErrorMessage
        icon="Play"
        message="No Video Found"
        description="Sorry there is an error to loading video"
      />
    );
  }

  return (
    <div className="mx-auto gap-4 lg:flex">
      <div className="lg:w-2/3">
        {isVideoLoading ? (
          <VideoLoading />
        ) : (
          videoData && (
            <>
              <VideoPlayer options={options} />
              <div className="flex space-x-3 rounded-2xl border border-gray-200 p-4 shadow-sm dark:border-secondary">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="w-full">
                    <div className="flex flex-col items-start justify-center gap-1 self-stretch">
                      <VideoTitle title={videoData.video?.title ?? ""} />
                    </div>
                  </div>

                  <div className="flex flex-row flex-wrap items-center gap-2">
                    <Link
                      href={`/channel/${String(videoData?.video?.userId)}`}
                      key={videoData?.video?.userId}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <UserImage
                          image={videoData?.video?.user?.image ?? ""}
                        />
                        <button className="flex flex-col">
                          <VideoUserName
                            name={videoData?.video?.user?.name ?? ""}
                          />
                          <p className="inline-flex gap-0.5 text-xs text-primary/70">
                            {videoData?.video?.followers}
                            <span> Followers</span>
                          </p>
                        </button>
                      </div>
                    </Link>
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      <LikeDislikeButton
                        EngagementData={{
                          id: videoData.video.id ?? "",
                          likes: videoData.video.likes ?? 0,
                          dislikes: videoData.video.dislikes ?? 0,
                        }}
                        viewer={{
                          hasDisliked:
                            videoData.video.viewer.hasDisliked ?? false,
                          hasLiked: videoData.video.viewer.hasLiked ?? false,
                        }}
                      />
                      <SaveButton videoId={videoData.video?.id ?? ""} />
                      <FollowButton
                        followingId={videoData.video.userId ?? ""}
                        viewer={{
                          hasFollowed: videoData.video.viewer.hasFollowed,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-md bg-muted p-2">
                    <VideoInfo
                      views={videoData.video.views ?? 0}
                      createdAt={videoData.video.createdAt ?? ""}
                      text={videoData.video.description ?? ""}
                      length={250}
                      border
                    />
                  </div>
                </div>
              </div>

              <div>
                <VideoComment
                  comments={videoData.video.comments.map(
                    ({ user, ...comment }) => ({
                      comment: {
                        id: comment.id,
                        message: comment.message,
                        videoId: comment.videoId,
                        userId: comment.userId,
                        parentId: comment.parentId,
                        createdAt: comment.createdAt,
                        updateAt: comment.updateAt,
                        replies: comment.replies.map((reply) => ({
                          id: reply.id,
                          message: reply.message,
                          videoId: reply.videoId,
                          userId: reply.userId,
                          parentId: reply.parentId,
                          createdAt: reply.createdAt,
                          updateAt: reply.updateAt,
                          likes: reply.likes,
                          dislikes: reply.dislikes,
                          user: {
                            id: reply.id,
                            name: reply.user?.name ?? "",
                            image: reply.user?.image ?? "",
                            handle: reply.user?.handle ?? "",
                          },
                          replies: [],
                        })),
                        likes: comment.likes,
                        dislikes: comment.dislikes,
                      },
                      user: {
                        id: user.id,
                        name: user.name,
                        image: user.image,
                        handle: user.handle,
                      },
                    }),
                  )}
                  videoId={videoId ?? ""}
                  refetch={refetchVideo}
                />
              </div>
            </>
          )
        )}
      </div>

      <div className="flex flex-col lg:w-1/3">
        {isRandomVideoLoading
          ? Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2 lg:flex-row mb-4">
                <Skeleton className="h-28 lg:w-1/2" />
                <div className="flex flex-col gap-2 lg:w-1/2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          : RandomVideoData && (
              <SmallSingleColumnVideo
                videos={RandomVideoData?.randomVideos.map((video) => ({
                  id: video?.id ?? "",
                  title: video?.title ?? "",
                  thumbnailUrl: video?.thumbnailUrl ?? "",
                  createdAt: video?.createdAt ?? new Date(),
                  views: video?.views ?? 0,
                }))}
                users={RandomVideoData?.randomVideos.map((user) => ({
                  name: user?.user.name ?? "",
                  image: user?.user.image ?? "",
                }))}
              />
            )}
      </div>
    </div>
  );
}
