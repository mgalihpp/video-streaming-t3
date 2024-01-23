"use client";

import fluidPlayer from "fluid-player";
import { memo, useEffect, useRef } from "react";
import "fluid-player/src/css/fluidplayer.css";

function VideoPlayer({ src }: { src: string | undefined }) {
  const self = useRef<HTMLVideoElement>(null);
  let player: FluidPlayerInstance | null = null;

  useEffect(() => {
    // Run only once when the component mounts
    if (!player && self.current) {
      player = fluidPlayer(self.current, {
        layoutControls: {
          miniPlayer: {
            enabled: false,
          },
          autoPlay: true,
          allowTheatre: false,
          loop: true,
          playbackRateEnabled: true,
          allowDownload: false,
          posterImage: '',
          doubleclickFullscreen: true,
          fillToContainer: false,
        },
      });
    }

    // Clean up the player when the component is unmounted
    // return () => {
    //   if (player && src !== undefined) {
    //     player.destroy();
    //   }
    // };
  }, [src]);

  return (
    <video width={"100%"} height={"100%"} ref={self} className="rounded-md">
      <source src={src} data-fluid-hd type="video/mp4" title="1080p" />
      <source
        src={src?.replace("/upload/", `/upload/q_70/`)}
        type="video/mp4"
        title="720p"
      />
      <source
        src={src?.replace("/upload/", `/upload/q_50/`)}
        type="video/mp4"
        title="480p"
      />
    </video>
  );
}

export default memo(VideoPlayer);
