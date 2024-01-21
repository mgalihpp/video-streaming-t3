"use client";

import {
  ErrorMessage,
  LoadingMessage,
  SmallSingleColumnVideo,
  VideoTitle,
  VideoInfo,
  UserImage,
  VideoUserName,
  FollowButton,
  LikeDislikeButton,
  VideoDescription,
  VideoCommentSection,
  SaveButton,
} from "@/components";
const VideoPlayer = lazy(() => import("@/components/VideoPlayer"));
import { Skeleton } from "@/components/ui/skeleton";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, lazy, memo, useEffect, useState } from "react";

function VideoPage() {
  const videoId = useSearchParams().get("video");
  const { data: sessionData } = useSession();

  const [isPlayerReady, setPlayerReady] = useState(false);

  const handlePlayerReady = () => {
    setPlayerReady(true);
  };

  const {
    data: videoData,
    isLoading: videoLoading,
    error: videoError,
    refetch: refectVideoData,
  } = api.video.getVideoById.useQuery(
    {
      id: videoId!,
      viewerId: sessionData?.user.id,
    },
    {
      enabled: !!videoId && !!sessionData?.user.id,
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: sideBarVideo,
    isLoading: sideBarLoading,
    error: sideBarError,
    refetch: refetchSideBarVideo,
  } = api.video.getRandomVideo.useQuery(20, {
    enabled: false, // this will not run automatically
  });

  const addViewCount = api.videoEngagement.addViewCount.useMutation();

  const addView = (input: { id: string }) => {
    addViewCount.mutate(input);
  };

  useEffect(() => {
    if (videoId) {
      void refectVideoData();
      addView({
        id: videoId,
      });
    }
  }, [videoId]);

  useEffect(() => {
    if (!sideBarVideo) {
      void refetchSideBarVideo();
    }
  }, [sideBarVideo]);

  const video = videoData?.video;
  const user = videoData?.user;
  const viewer = videoData?.viewer;
  const errorTypes = videoError ?? !video ?? !user ?? !viewer;

  // change metadata
  const title = `${video?.title ?? "Video App"}`;
  const description = `${video?.description ?? " "}`;
  useDocumentTitle({ title: title, description: description });

  const Error = () => {
    if (videoLoading) {
      return <LoadingMessage />;
    } else if (errorTypes) {
      return (
        <ErrorMessage
          icon="Play"
          message="Video Error"
          className="items-center"
          description="Sorry there is an error to loading video"
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <main className="mx-auto lg:flex">
      {errorTypes ? (
        <Error />
      ) : (
        <>
          <div className="w-full sm:px-4 lg:w-4/5">
            <div className="py-4">
              <Suspense
                fallback={
                  <Skeleton className="h-[200px] w-full sm:h-[300px] lg:h-[499px]" />
                }
              >
                <VideoPlayer src={video?.videoUrl} />
              </Suspense>
            </div>
            <div className="flex space-x-3 rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="min-w-0 flex-1 space-y-3 ">
                <div className="xs:flex-wrap flex flex-row justify-between gap-4 max-md:flex-wrap">
                  <div className="flex flex-col items-start justify-center gap-1 self-stretch ">
                    <VideoTitle title={video?.title ?? ""} />
                    <VideoInfo
                      views={video?.views ?? 0}
                      createdAt={video?.createdAt ?? ""}
                    />
                  </div>
                  <div className="flex-inline flex items-end justify-start  gap-4 self-start  ">
                    <LikeDislikeButton
                      EngagementData={{
                        id: video?.id ?? "",
                        likes: video?.likes ?? 0,
                        dislikes: video?.dislikes ?? 0,
                      }}
                      viewer={{
                        hasDisliked: viewer?.hasDisliked ?? false,
                        hasLiked: viewer?.hasLiked ?? false,
                      }}
                    />
                    <SaveButton videoId={video?.id ?? ""} />
                  </div>
                </div>

                <div className="flex flex-row  place-content-between gap-x-4 ">
                  <Link
                    href={`/channel/${String(video?.userId)}`}
                    key={video?.userId}
                  >
                    <div className="flex flex-row gap-2">
                      <UserImage image={user?.image ?? ""} />
                      <button className="flex flex-col">
                        <VideoUserName name={user?.name ?? ""} />
                        <p className=" text-sm text-gray-600">
                          {user?.followers}
                          <span> Followers</span>
                        </p>
                      </button>
                    </div>
                  </Link>
                  <FollowButton
                    followingId={user?.id ?? ""}
                    viewer={{
                      hasFollowed: viewer?.hasFollowed ?? false,
                    }}
                  />
                </div>
                <VideoDescription
                  text={video?.description ?? ""}
                  length={200}
                  border={true}
                />
              </div>
            </div>
            <VideoCommentSection
              videoId={video?.id ?? ""}
              comments={
                videoData?.comments?.map(({ user, comment }) => ({
                  comment: {
                    id: comment.id,
                    message: comment.message,
                    createdAt: comment.createdAt,
                  },
                  user: {
                    id: user.id,
                    name: user.name,
                    image: user.image,
                    handle: user.handle,
                  },
                })) ?? []
              }
              refetch={refectVideoData}
            />
          </div>
        </>
      )}
      <div className="px-4 lg:w-2/5 lg:px-0">
        {!sideBarVideo ? (
          <LoadingMessage count={6} small />
        ) : (
          <>
            <SmallSingleColumnVideo
              refetch={refetchSideBarVideo}
              videos={
                sideBarVideo?.videos.map((video) => ({
                  id: video?.id ?? "",
                  title: video?.title ?? "",
                  thumbnailUrl: video?.thumbnailUrl ?? "",
                  createdAt: video?.createdAt ?? new Date(),
                  views: video?.views ?? 0,
                })) ?? []
              }
              users={
                sideBarVideo?.users.map((user) => ({
                  name: user?.name ?? "",
                  image: user?.image ?? "",
                })) ?? []
              }
            />
          </>
        )}
      </div>
    </main>
  );
}

export default memo(VideoPage);
