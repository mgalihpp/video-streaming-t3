// @ts-nocheck
"use client";

import { createRoot } from "react-dom/client";
import React from "react";
import videojs from "video.js";
import "videojs-sprite-thumbnails";
import "video.js/dist/video-js.css";
import { Settings } from "./Icons/Icons";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady, src } = props;
  const [open, setOpen] = React.useState(false);

  const handleContextMenu = (event) => {
    // Prevent the default right-click context menu
    event.preventDefault();
  };

  const memoizedOptions = React.useMemo(() => options, [options]);
  const memoizedOnReady = React.useCallback(
    (player) => {
      onReady && onReady(player);
    },
    [onReady],
  );

  // Function to change the video source
  const changeVideoSource = (newSource, startTime = 0) => {
    const player = playerRef.current;
    if (player) {
      player.src(newSource);

      player.one("loadedmetadata", () => {
        // Update duration after changing source
        const newDuration = player.duration();

        // Seek to the specified start time
        player.currentTime(startTime);

        // Optionally, you can play the video here
        player.play();

        // Log the new duration for debugging
        console.log("New Duration:", newDuration);
      });

      player.load();
      setOpen(false);
    }
  };

  const captureFramesAtIntervals = async (videoUrl, intervalInSeconds) => {
    const frames = [];

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const video = document.createElement("video");
      video.src = URL.createObjectURL(blob);

      await new Promise((resolve) => {
        video.addEventListener("loadeddata", () => {
          const duration = video.duration;

          for (
            let currentTime = 0;
            currentTime < duration;
            currentTime += intervalInSeconds
          ) {
            video.currentTime = currentTime;

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            video.addEventListener("seeked", () => {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);

              const imageUrl = canvas.toDataURL();
              frames.push({ imageUrl });
            });

            video.addEventListener("error", (error) => {
              console.error("Error seeking video:", error);
            });

            video.currentTime = currentTime;
          }

          resolve();
        });
      });
    } catch (error) {
      console.error("Error capturing frames:", error);
    }

    return frames;
  };

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");
      videoElement.addEventListener("contextmenu", handleContextMenu);

      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(
        videoElement,
        memoizedOptions,
        async () => {
          videojs.log("player is ready");
          memoizedOnReady(player);

          player.on("play", async () => {
            try {
              console.log("Start capturing frames");
              const frames = await captureFramesAtIntervals(src, 30);

              // Simulate waiting for a short period (adjust as needed)
              await new Promise((resolve) => setTimeout(resolve, 1000));

              player.spriteThumbnails({
                interval: 30,
                urlArray: frames.map((frame) => frame.imageUrl),
                columns: frames.length,
                rows: 1,
                width: 120,
                height: 90,
              });
            } catch (error) {
              console.error("Error capturing frames:", error);
            }
          });

          // Add a custom button to the control bar
          const customButton = player.controlBar.addChild("button", {}, 13);
          customButton.addClass("!flex !items-center !justify-center");
          const root = createRoot(customButton.el());

          root.render(
            <Settings className="h-5 w-5 stroke-secondary dark:stroke-primary " />,
          );
          customButton.on("click", () => {
            setOpen(true);
          });
        },
      ));

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    }
    // else {
    //   const player = playerRef.current;

    //   player.autoplay(memoizedOptions.autoplay);
    //   player.src(memoizedOptions.sources);
    // }
  }, [memoizedOptions, memoizedOnReady, videoRef]);

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
      <div ref={videoRef} onContextMenu={handleContextMenu} />
      <SelectQuality
        open={open}
        setOpen={setOpen}
        src={src}
        handleChangeQuality={changeVideoSource}
      />
    </div>
  );
};

export default VideoJS;

function SelectQuality({ open, setOpen, src, handleChangeQuality }) {
  const { toast } = useToast();
  const FormSchema = z.object({
    quality: z
      .string()
      .refine(
        (value) =>
          value === src ||
          value === src?.replace("/upload/", `/upload/q_70/`) ||
          value === src?.replace("/upload/", `/upload/q_50/`),
        {
          message: "please select a quality",
        },
      ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    handleChangeQuality(data.quality);
    toast({
      title: "You change quality",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
            <FormField
              control={form.control}
              name="quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quality</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={src}>1080p</SelectItem>
                      <SelectItem
                        value={src?.replace("/upload/", `/upload/q_70/`)}
                      >
                        720p
                      </SelectItem>
                      <SelectItem
                        value={src?.replace("/upload/", `/upload/q_50/`)}
                      >
                        480p
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>You can change quality</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
