"use client";

import fluidPlayer from "fluid-player";
import { useEffect, useRef } from "react";
import "fluid-player/src/css/fluidplayer.css";

export default function VideoPlayer({ src }: { src: string | undefined }) {
  const self = useRef<HTMLVideoElement>(null);
  let player: FluidPlayerInstance | null = null;

  console.log(src);

  const qualities = [
    { quality: "q_70", title: "720p" },
    { quality: "q_50", title: "480p" },
  ];

  useEffect(() => {
    // Run only once when the component mounts
    if (!player && self.current) {
      player = fluidPlayer(self.current, {});
    }

    // Clean up the player when the component is unmounted
    // return () => {
    //   if (player) {
    //     player.destroy();
    //   }
    // };
  }, [player]);

  return (
    <video width={"100%"} height={"100%"} ref={self}>
      <source src={src} data-fluid-hd type="video/mp4" title="1080p" />
      {qualities.map((quality, index) => (
        <source
          key={index}
          src={src?.replace("/upload/", `/upload/${quality.quality}/`)}
          type="video/mp4"
          title={quality.title}
          data-fluid-sd
        />
      ))}
    </video>
  );
}
