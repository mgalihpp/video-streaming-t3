"use client";

import { type ChangeEvent, type DragEvent, useState } from "react";
import { Plus } from "../Icons/Icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { api } from "@/trpc/react";
import { env } from "@/env";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useDispatch } from "react-redux";
import { openDialog } from "@/store/editDialog";
import { setTriggerRefetch } from "@/store/refetchUpload";
import { Progress } from "../ui/progress";

export default function UploadButton() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [disable, setDisable] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | FileList | null>(
    null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const { toast } = useToast();

  const cloudinaryName = env.NEXT_PUBLIC_CLOUDINARY_NAME ?? "";

  const addNewVideoMutation = api.video.addNewVideo.useMutation();

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedVideo(e.target.files[0] ? e.target.files[0] : null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
      setUploadedVideo(files[0]!);
    }
  };

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };

  const handleSubmit = () => {
    type UploadResponse = {
      secure_url: string;
    };

    if (!uploadedVideo) console.error("select file please");

    const progress = startSimulatedProgress();
    setDisable(true);

    const videoData = {
      videoUrl: "",
    };
    const uniqueUploadId = generateUniqueUploadId();
    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil((uploadedVideo as File).size / chunkSize);
    let currentChunk = 0;

    const UploadChunk = async (start: number, end: number) => {
      const formData = new FormData();
      formData.append("upload_preset", "user_uploads");
      formData.append("file", (uploadedVideo as File).slice(start, end));
      const contentRange = `bytes ${start}-${end - 1}/${
        (uploadedVideo as File).size
      }`;

      console.log(
        `Uploading chunk for file: ${
          (uploadedVideo as File).name
        }; start: ${start}, end: ${end - 1}`,
      );

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/" + cloudinaryName + "/auto/upload",
          {
            method: "POST",
            body: formData,
            headers: {
              "X-Unique-Upload-Id": uniqueUploadId,
              "Content-Range": contentRange,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Chunk upload failed");
        }

        currentChunk++;

        if (currentChunk < totalChunks) {
          const nextStart = currentChunk * chunkSize;
          const nextEnd = Math.min(
            nextStart + chunkSize,
            (uploadedVideo as File).size,
          );
          UploadChunk(nextStart, nextEnd);
        } else {
          clearInterval(progress);
          setUploadProgress(100);

          toast({
            title: "Upload Successfully",
            variant: "success",
          });

          const fetchResponse = (await response.json()) as UploadResponse;

          if (fetchResponse.secure_url !== undefined) {
            const newVideoData = {
              ...videoData,
              ...(fetchResponse.secure_url && {
                videoUrl: fetchResponse.secure_url,
              }),
            };

            addNewVideoMutation.mutate(newVideoData, {
              onSuccess: (video) => {
                dispatch(setTriggerRefetch(true));
                setOpen(false);
                setUploadedVideo(null);
                setDisable(false);
                dispatch(openDialog(video.id));
              },
              onError: () => {
                setDisable(false);
              },
            });
          }

          console.info("File upload completed.");
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setDisable(false);
      }

      // const formData = new FormData();

      // formData.append("upload_preset", "user_uploads");

      // if (uploadedVideo) {
      //   formData.append("file", uploadedVideo as File);
      // }

      // fetch(
      //   "https://api.cloudinary.com/v1_1/" + cloudinaryName + "/video/upload",
      //   {
      //     method: "POST",
      //     body: formData,
      //   },
      // )
      //   .then((response) => response.json() as Promise<UploadResponse>)
      //   .then((data) => {
      //     if (data.secure_url !== undefined) {
      //       const newVideoData = {
      //         ...videoData,
      //         ...(data.secure_url && { videoUrl: data.secure_url }),
      //       };

      //       addNewVideoMutation.mutate(newVideoData, {
      //         onSuccess: (video) => {
      //           toast({
      //             title: "Upload Successfully",
      //             variant: "success",
      //           });
      //           clearInterval(progress);
      //           setTimeout(() => {
      //             dispatch(setTriggerRefetch(true));
      //             setOpen(false);
      //             setUploadedVideo(null);
      //             setDisable(false);
      //             dispatch(openDialog(video.id));
      //           }, 1000);
      //         },
      //         onError: () => {
      //           setDisable(false);
      //         },
      //       });
      //     }
      //   })
      //   .catch((error) => console.error(error));
    };

    const starts = 0;
    const ends = Math.min(chunkSize, (uploadedVideo as File).size);
    UploadChunk(starts, ends);
  };

  const generateUniqueUploadId = () => {
    return `uqid-${Date.now()}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex">
          <Plus className="mr-2 h-4 w-4 shrink-0 stroke-secondary" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="sm:flex sm:items-start">
          <div className="mt-3 w-full text-left sm:mt-0">
            <DialogHeader>
              <DialogTitle>Upload Video</DialogTitle>
              <DialogDescription>Create a new video here.</DialogDescription>
            </DialogHeader>
            <div className="col-span-full mt-2">
              <div
                className="mt-2 flex justify-center rounded-lg border border-dashed border-primary bg-secondary px-6 py-10"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {uploadedVideo ? (
                  <>
                    <div className="justify-centers flex flex-col items-center gap-4">
                      {!disable && <p>Your video has been attached.</p>}
                      {disable && (
                        <>
                          <p>Uploading...</p>
                          <p>Please don&apos;t leave this window.</p>
                          <Progress
                            value={uploadProgress}
                            indicatorColor={
                              uploadProgress === 100
                                ? "bg-green-500"
                                : "bg-primary"
                            }
                            className="h-1 w-full bg-background"
                          />
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <>
                        <div className="mt-4 flex text-sm leading-6 text-primary/80">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-secondary font-semibold text-primary focus-within:outline-none hover:text-primary/90"
                          >
                            <span>Upload file</span>
                            <input
                              type="file"
                              name="file-upload"
                              id="file-upload"
                              className="sr-only"
                              accept=".mp4"
                              onChange={onFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-primary/80">
                          .mp4 Max to 100MB
                        </p>
                      </>
                    </div>
                  </>
                )}
              </div>
              <div className="relative mt-5 flex flex-row-reverse gap-2 sm:mt-4">
                <Button
                  type="button"
                  disabled={disable || !uploadedVideo}
                  onClick={handleSubmit}
                >
                  {disable ? (
                    <>
                      <p>Uploading...</p>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setUploadedVideo(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
