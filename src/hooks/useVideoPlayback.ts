import VideoPlayerHelper from "@/helpers/videoPlayerHelper";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface VideoPlaybackOptions {
  videoId?: string | null;
  playlistId?: string | null;
  startedPlaylistVideoIndex?: string | null;
}

export function useVideoPlayback({
  videoId,
  playlistId,
  startedPlaylistVideoIndex,
}: VideoPlaybackOptions) {
  const { data: session } = useSession();

  // this is used for playlists playback
  const [nextVideoId, setNextVideoId] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    data: videoData,
    isLoading: isVideoLoading,
    isFetched: isVideoFetched,
    error: isVideoError, // unused cause of server side call
    refetch: refetchVideo,
  } = api.video.getVideobyId.useQuery(
    { id: videoId ?? "", viewerId: session?.user.id },
    { enabled: !!videoId, refetchOnWindowFocus: false },
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

  const { data: playlistData, isLoading: isPlaylistLoading } =
    api.playlist.getPlaylistById.useQuery(
      { id: playlistId ?? "" },
      {
        enabled: !!playlistId,
        refetchOnWindowFocus: false,
      },
    );

  const { mutateAsync: addViewCount } =
    api.videoEngagement.addViewCount.useMutation();

  // https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams
  const updateQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  useEffect(() => {
    if (videoId && videoData?.video.id) {
      addViewCount({ id: videoData.video.id }).catch((error) =>
        console.log(error),
      );
    }
    if (
      playlistData &&
      videoId !==
        playlistData?.PlaylistHasVideo[
          parseInt(startedPlaylistVideoIndex ?? "1") - 1
        ]?.id
    ) {
      router.push(
        pathname +
          "?" +
          updateQueryString(
            "video",
            `${playlistData?.PlaylistHasVideo[parseInt(startedPlaylistVideoIndex ?? "1") - 1]?.id}`,
          ),
      );
    }
    if (startedPlaylistVideoIndex === "0") {
      router.push(pathname + "?" + updateQueryString("start", "1"));
    }
    if (playlistData) {
      if (startedPlaylistVideoIndex) {
        const playlistsLength = playlistData.PlaylistHasVideo.length;
        if (parseInt(startedPlaylistVideoIndex) >= playlistsLength) {
          setNextVideoId(playlistData.PlaylistHasVideo[0]?.id ?? "");
          return;
        }
        const nextIndex = parseInt(startedPlaylistVideoIndex);
        setNextVideoId(playlistData.PlaylistHasVideo[nextIndex]?.id ?? "");
      }
    }
  }, [
    videoId,
    videoData?.video.id,
    startedPlaylistVideoIndex,
    pathname,
    router,
    addViewCount,
    updateQueryString,
    playlistData,
  ]);

  const options = useMemo(() => {
    const videoHelper = new VideoPlayerHelper(
      playlistData,
      startedPlaylistVideoIndex ?? "1",
      videoData,
    );
    return {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      sources: [
        {
          src: videoHelper.playVideoSource(),
          type: videoHelper.getVideoType(videoHelper.playVideoSource()),
        },
      ],
      html5: {
        vhs: {
          withCredentials: false,
        },
      },
      poster: videoHelper.getThumbnailSource(),
      spriteThumbnails: videoHelper.getSpriteThumbnails() ?? [],
      nextVideoId: nextVideoId,
      playlistData: playlistData,
    };
  }, [playlistData, videoData, startedPlaylistVideoIndex, nextVideoId]);

  return {
    options,
    startedPlaylistVideoIndex,
    nextVideoId,
    setNextVideoId,
    videoData,
    RandomVideoData,
    playlistData,
    isVideoLoading,
    isRandomVideoLoading,
    isPlaylistLoading,
    isVideoFetched,
    isVideoError,
    refetchVideo,
    updateQueryString,
  };
}
