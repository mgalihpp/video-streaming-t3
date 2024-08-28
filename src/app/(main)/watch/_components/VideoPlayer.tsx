import React, { memo, useCallback } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";
import "@/plugins/videojs/httpSourceSelector";
import { type CustomPlayer } from "@/types/video";
import initSpriteThumbnails from "@/plugins/videojs/spriteThumbnails";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface VideoPlayerProps {
  options: {
    autoplay: boolean;
    controls: boolean;
    sources: {
      src?: string;
      type: string;
    }[];
    spriteThumbnails?: string[];
    poster?: string;
    nextVideoId?: string;
    playlistData?: {
      PlaylistHasVideo: {
        id?: string | undefined;
      }[];
    };
  };
}

export const VideoPlayer = memo(
  ({ options }: VideoPlayerProps) => {
    const videoRef = React.useRef<HTMLDivElement | null>(null);
    const playerRef = React.useRef<CustomPlayer | null>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handlePlayerReady = useCallback(
      (player: CustomPlayer) => {
        player.httpSourceSelector?.();
        player.controlBar?.addClass("rounded-md");

        // Initialize sprite thumbnails
        if (options.spriteThumbnails) {
          initSpriteThumbnails(player, {
            urlArray: options.spriteThumbnails,
            interval: 30,
            width: 120,
            height: 70,
            columns: 1,
            rows: 1,
          });
        }

        // You can handle player events here, for example:
        player.on("waiting", () => {
          videojs.log("player is waiting");
        });

        // handle video end if there has playlist it will navigate to next video
        player.on("ended", () => {
          videojs.log("player has ended");
          const playlistId = searchParams.get("playlist");
          const startedPlaylistVideoIndex = searchParams.get("start");

          if (
            options.nextVideoId &&
            playlistId &&
            options.playlistData &&
            startedPlaylistVideoIndex
          ) {
            videojs.log("player has ended and navigating to next video");

            const nextIndex = parseInt(startedPlaylistVideoIndex) + 1;

            if (nextIndex > options.playlistData.PlaylistHasVideo.length) {
              router.push(
                pathname +
                  "?" +
                  `video=${options.nextVideoId}&playlist=${playlistId}&start=1`,
              );
              return;
            }

            router.push(
              pathname +
                "?" +
                `video=${options.nextVideoId}&playlist=${playlistId}&start=${nextIndex}`,
            );
          }
        });

        player.on("dispose", () => {
          videojs.log("player will dispose");
        });
      },
      [options, searchParams, router, pathname],
    );

    React.useEffect(() => {
      // Make sure Video.js player is only initialized once
      if (!playerRef.current) {
        // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
        const videoElement = document.createElement("video-js");

        videoElement.classList.add("vjs-16-9");
        videoElement.classList.add("vjs-big-play-centered");
        videoElement.style.borderRadius = "6px";
        videoRef.current?.appendChild(videoElement);

        const player = (playerRef.current = videojs(
          videoElement,
          options,
          () => {
            videojs.log("player is ready");
            handlePlayerReady(player);
          },
        ));

        // You could update an existing player in the `else` block here
        // on prop change, for example:
      } else {
        const player = playerRef.current;

        player.autoplay(options.autoplay);
        player.src(options.sources);
        player.poster(options.poster);

        initSpriteThumbnails(player, {
          urlArray: options.spriteThumbnails,
          interval: 30,
          width: 120,
          height: 70,
          columns: 1,
          rows: 1,
        });

        handlePlayerReady(player);
      }
    }, [
      options.autoplay,
      options.controls,
      options.sources,
      options,
      playerRef,
      options.spriteThumbnails,
      videoRef,
      handlePlayerReady,
    ]);

    // Dispose the Video.js player when the functional component unmounts
    React.useEffect(() => {
      const player = playerRef.current;

      return () => {
        if (player && !player.isDisposed()) {
          player.dispose();
          playerRef.current = null;
        }
      };
    }, [playerRef]);

    return (
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.options.autoplay === nextProps.options.autoplay &&
      prevProps.options.controls === nextProps.options.controls &&
      prevProps.options.sources[0]?.src === nextProps.options.sources[0]?.src &&
      prevProps.options.sources[0]?.type ===
        nextProps.options.sources[0]?.type &&
      prevProps.options.poster === nextProps.options.poster &&
      prevProps.options.nextVideoId === nextProps.options.nextVideoId &&
      prevProps.options.spriteThumbnails === nextProps.options.spriteThumbnails
      // Ignore playlistData
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
