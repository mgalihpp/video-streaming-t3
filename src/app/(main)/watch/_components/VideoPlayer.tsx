import React, { memo } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";
import "@/plugins/videojs/httpSourceSelector";
import { type CustomPlayer } from "@/types/video";
import initSpriteThumbnails from "@/plugins/videojs/spriteThumbnails";

interface VideoPlayerProps {
  options: {
    autoplay: boolean;
    controls: boolean;
    sources: {
      src?: string;
      type: string;
    }[];
    spriteThumbnails?: string[];
  };
}

export const VideoPlayer = memo(({ options }: VideoPlayerProps) => {
  const videoRef = React.useRef<HTMLDivElement | null>(null);
  const playerRef = React.useRef<CustomPlayer | null>(null);

  const handlePlayerReady = (player: CustomPlayer) => {
    player.httpSourceSelector?.();
    player.controlBar?.addClass("rounded-md");
    initSpriteThumbnails(player, {
      urlArray: options.spriteThumbnails,
      interval: 30,
      width: 120,
      height: 70,
      columns: 1,
      rows: 1,
    });

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-16-9");
      videoElement.classList.add("vjs-big-play-centered");
      videoElement.style.borderRadius = "6px";
      videoRef.current?.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        handlePlayerReady(player);
      }));

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

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
});

VideoPlayer.displayName = "VideoPlayer";
