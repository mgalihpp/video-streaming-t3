"use client";

import { ChangeEvent, DragEvent, useState } from "react";
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
import { router } from "@trpc/server";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function UploadButton() {
  const [open, setOpen] = useState(false);
  const [disable, setDisable] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | FileList | null>(
    null,
  );
  const router = useRouter();

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

  const handleSubmit = () => {
    type UploadResponse = {
      secure_url: string;
    };

    setDisable(true);

    const videoData = {
      videoUrl: "",
    };

    const formData = new FormData();

    formData.append("upload_preset", "user_uploads");

    if (uploadedVideo) {
      formData.append("file", uploadedVideo as File);
    }

    fetch(
      "https://api.cloudinary.com/v1_1/" + cloudinaryName + "/video/upload",
      {
        method: "POST",
        body: formData,
      },
    )
      .then((response) => response.json() as Promise<UploadResponse>)
      .then((data) => {
        if (data.secure_url !== undefined) {
          const newVideoData = {
            ...videoData,
            ...(data.secure_url && { videoUrl: data.secure_url }),
          };

          addNewVideoMutation.mutate(newVideoData, {
            onSuccess: () => {
              setOpen(false);
              setUploadedVideo(null);
              setDisable(false);
              router.refresh();
            },
            onError: () => {
              setDisable(false);
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex">
          <Plus className="mr-2 h-4 w-4 shrink-0 stroke-white" />
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
                className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {uploadedVideo ? (
                  <p>Your video has been attached.</p>
                ) : (
                  <>
                    <div className="text-center">
                      <>
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/90"
                          >
                            <span>Upload file</span>
                            <input
                              type="file"
                              name="file-upload"
                              id="file-upload"
                              className="sr-only"
                              onChange={onFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">MP4</p>
                      </>
                    </div>
                  </>
                )}
              </div>
              <div className="relative mt-5 flex flex-row-reverse gap-2 sm:mt-4">
                <Button type="button" disabled={disable} onClick={handleSubmit}>
                  {disable ? (
                    <>
                      <p>Uploading...</p>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
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
