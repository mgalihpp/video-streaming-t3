/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { PlusVideo } from "@/components/Icons/Icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Check, Info, Loader2, PlayIcon } from "lucide-react";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { videoDetailSchema } from "@/lib/schema/video";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { ImageCropper } from "@/components/ImageCropper";
import { dataURLToFile } from "@/helpers/dataUrlToFile";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Confetti from "@/components/Confetti";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { Skeleton } from "@/components/ui/skeleton";

export const UploadButton = () => {
  const steps = ["Upload Video", "Video Details", "Review"];
  const [currentStep, setCurrentStep] = useState(1);
  const [complete, setComplete] = useState(false);
  const [isCrop, setIsCrop] = useState(false);

  const videoId = useSearchParams().get("vId");
  const step = useSearchParams().get("step");
  const completed = useSearchParams().get("completed");

  const router = useRouter();

  const {
    data: freshVideoData,
    isLoading,
    refetch,
  } = api.video.getFreshVideoById.useQuery(
    { id: videoId! },
    { enabled: !!videoId },
  );

  const { mutate: updateVideo } = api.video.updateVideo.useMutation();

  useEffect(() => {
    if (videoId && freshVideoData && step === "2") {
      setCurrentStep(2);
    } else if (!videoId && !freshVideoData && step === "2") {
      setCurrentStep(1);
    } else if (videoId && freshVideoData && step === "3") {
      setCurrentStep(3);
    } else if (!videoId && !freshVideoData && step === "3") {
      setCurrentStep(1);
    }
  }, [videoId, step, freshVideoData]);

  const {
    uploadFile,
    setUploadFile,
    uploadImageFile,
    setUploadImageFile,
    croppedImage,
    setCroppedImage,
    isUploading,
    uploadProgress,
    onFileChange,
    handleDrop,
    onUpload,
  } = useVideoUpload();

  const form = useForm<z.infer<typeof videoDetailSchema>>({
    resolver: zodResolver(videoDetailSchema),
  });

  const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadImageFile(e.target.files[0] ? e.target.files[0] : null);
      setIsCrop(true);
    }
  };

  const onUpdateVideo = async (data: z.infer<typeof videoDetailSchema>) => {
    setIsCrop(false);

    if (!croppedImage) {
      updateVideo(
        {
          id: videoId ?? "",
          title: data.title,
          description: data.description ?? "",
          publish: data.publish,
          thumbnailUrl:
            "https://res.cloudinary.com/ddhvywd6h/image/upload/v1723974681/qw7lplxygrqjjmhcody3.png",
        },
        {
          onSuccess: (data) => {
            toast.success("Video updated successfully");
            void refetch();

            router.push(`?vId=${data.id}&step=3&completed=1`);
          },
          onError: (err) => {
            toast.error(`Error when updating video: ${err.message}`);
          },
        },
      );

      return;
    }

    await onUpload({
      fileToUpload: dataURLToFile(croppedImage, `${Date.now().toString()}`),
      data: {
        id: videoId ?? "",
        title: data.title,
        description: data.description ?? "",
        publish: data.publish,
      },
      cb: setCurrentStep,
      updateParams: true,
      refetch,
      type: "image",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 max-md:w-full">
          <PlusVideo className="size-5 fill-white stroke-none" />
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-screen max-w-4xl overflow-y-auto")}>
        <div className="flex justify-between">
          {steps?.map((step, i) => (
            <div
              key={i}
              className={`step-item ${currentStep === i + 1 && "active"} ${
                (i + 1 < currentStep || complete) && "complete"
              } `}
            >
              <span
                className={`step-bar ${currentStep === i + 1 && "active"} ${
                  (i + 1 < currentStep || complete) && "complete"
                } `}
              ></span>
              <div className="step">
                {i + 1 < currentStep || complete ? (
                  <Check className="size-4" />
                ) : (
                  i + 1
                )}
              </div>
              <p className="text-xs text-gray-500 sm:text-sm">{step}</p>
            </div>
          ))}
        </div>

        {steps[currentStep - 1] === "Upload Video" && (
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-left sm:mt-0">
              <DialogHeader>
                <DialogTitle className="sm:text-xl">Upload Video</DialogTitle>
                <DialogDescription>Create a new video here.</DialogDescription>
              </DialogHeader>
              <div className="col-span-full mt-2">
                <div
                  className="mt-2 flex justify-center rounded-lg border border-dashed border-primary bg-secondary px-6 py-20"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {uploadFile ? (
                    <>
                      <div className="justify-centers flex flex-col items-center gap-4">
                        {!isUploading && <p>Your video has been attached.</p>}
                        {isUploading && (
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
                              className="block h-1 w-full bg-background"
                            />
                            <span className="text-center text-primary">{`${uploadProgress}%`}</span>
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
                <span className="mt-1 inline-flex items-center gap-2 text-xs">
                  <Info className="size-3 max-sm:hidden" />
                  <p>
                    Upload can take while to complete. It&apos;s depends on
                    encoding service speed and your internet speed ;)
                  </p>
                </span>
                <div className="relative mt-5 flex flex-row-reverse gap-2 sm:mt-4">
                  <Button
                    type="button"
                    disabled={isUploading || !uploadFile}
                    onClick={() =>
                      onUpload({
                        cb: setCurrentStep,
                        fileToUpload: uploadFile,
                        type: "video",
                      })
                    }
                  >
                    {isUploading ? (
                      <>
                        <p>Uploading...</p>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      </>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!uploadFile}
                    onClick={() => {
                      setUploadFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {steps[currentStep - 1] === "Video Details" && (
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-left">
              <DialogHeader>
                <DialogTitle className="sm:text-xl">Video Details</DialogTitle>
                <DialogDescription>Add video details here.</DialogDescription>
              </DialogHeader>

              <div className="col-span-full mt-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onUpdateVideo)}>
                    <FormField
                      name="title"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormDescription>
                            This is how people will identify your video.
                          </FormDescription>
                          <FormControl>
                            <Input placeholder="Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormDescription>
                            You can add more details about your video here.
                          </FormDescription>
                          <FormControl>
                            <Textarea placeholder="Description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-full mt-2">
                      <label className="block text-sm font-medium leading-6 text-primary">
                        Thumbnail
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Select or upload an image that shows the content of your
                        video. A good thumbnail will look unique and attract the
                        attention of the audience.
                      </p>
                      <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="mt-2 flex justify-center rounded-lg border border-dashed border-primary bg-secondary px-6 py-10"
                      >
                        <div className="text-center">
                          {croppedImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={croppedImage} alt="cropped" />
                          ) : isCrop ? (
                            <ImageCropper
                              image={uploadImageFile}
                              setCroppedImage={setCroppedImage}
                            />
                          ) : (
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
                                    accept=".png, .jpg, .jpeg"
                                    className="sr-only"
                                    onChange={onImageFileChange}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs leading-5 text-primary/80">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-5 flex flex-row-reverse gap-2 sm:mt-4">
                      <Button
                        type="submit"
                        // disabled={isUploading || !uploadFile}
                      >
                        {isUploading ? (
                          <>
                            <p>Updating...</p>
                            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                          </>
                        ) : (
                          "Update"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          router.push(`?vId=&step=1&completed=0`);
                        }}
                        // disabled={!uploadFile}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        )}

        {steps[currentStep - 1] === "Review" && (
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center">
              <DialogHeader className="flex flex-col items-center justify-center">
                <DialogTitle className="sm:text-2xl">Reviews</DialogTitle>
                <DialogDescription>
                  Congratulations on your new video.
                </DialogDescription>
              </DialogHeader>

              {isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <div className="col-span-full mt-6 flex justify-center">
                  <Card className="w-full">
                    <CardContent className="flex-shrink p-2">
                      <div
                        className="group relative w-full cursor-pointer rounded-md"
                        onClick={() =>
                          router.push(`/watch?video=${freshVideoData?.id}`)
                        }
                      >
                        <ThumbnailImage
                          thumbnail={freshVideoData?.thumbnailUrl ?? ""}
                          title={freshVideoData?.title ?? ""}
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          <PlayIcon className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Confetti />
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ThumbnailImage = ({
  thumbnail,
  title,
}: {
  thumbnail: string;
  title: string;
}) => {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const imageLoaded = useImagePreloader(imageRef);
  return (
    <>
      {!imageLoaded && <Skeleton className="h-96 w-full rounded-lg" />}
      <Image
        ref={imageRef}
        src={thumbnail}
        alt={`Video Thumbnail of ${title}`}
        width="400"
        height="240"
        className="aspect-video w-full rounded-lg object-cover"
        loading="eager"
        style={{
          display: imageLoaded ? "block" : "none",
        }}
      />
    </>
  );
};
