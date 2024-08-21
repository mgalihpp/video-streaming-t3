"use client";

import { ImageCropper } from "@/components/ImageCropper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Thumbnail } from "@/components/video/Thumbnail";
import { dataURLToFile } from "@/helpers/dataUrlToFile";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { videoDetailSchema } from "@/lib/schema/video";
import { api } from "@/trpc/react";
import { Switch } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export default function EditPage() {
  const [isCrop, setIsCrop] = useState(false);

  const router = useRouter();

  const videoId = useSearchParams().get("vId");

  const {
    data: freshVideoData,
    isLoading,
    refetch,
  } = api.video.getFreshVideoById.useQuery(
    { id: videoId! },
    { enabled: !!videoId },
  );

  const { mutate: updateVideo } = api.video.updateVideo.useMutation();

  const {
    croppedImage,
    setCroppedImage,
    uploadImageFile,
    setUploadImageFile,
    isUploading,
    handleDrop,
    onUpload,
  } = useVideoUpload();

  const form = useForm<z.infer<typeof videoDetailSchema>>({
    resolver: zodResolver(videoDetailSchema),
    defaultValues: {
      title: "",
      description: "",
      publish: false,
    },
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
            data.thumbnailUrl ??
            "https://res.cloudinary.com/ddhvywd6h/image/upload/v1723974681/qw7lplxygrqjjmhcody3.png",
        },
        {
          onSuccess: () => {
            toast.success("Video updated successfully");
            void refetch();
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
      refetch,
      type: "image",
    });
  };

  useEffect(() => {
    if (freshVideoData) {
      form.setValue("title", freshVideoData?.title);
      form.setValue("description", freshVideoData?.description);
      form.setValue("publish", freshVideoData?.publish);
      form.setValue("thumbnailUrl", freshVideoData?.thumbnailUrl);
    }
  }, [freshVideoData, form]);

  if (!freshVideoData) {
    return <div>Not found</div>;
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex w-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="size-5" />
            </Button>
          </div>
          <h2 className="flex gap-2 text-lg font-bold md:text-3xl">
            Edit{" "}
            {isLoading ? (
              <Skeleton className="h-9 w-40" />
            ) : (
              freshVideoData?.title
            )}
          </h2>
        </div>
      </div>

      <div>
        <div className="sm:flex sm:items-start">
          <div className="mt-3 w-full text-left">
            <div className="flex flex-col space-y-1.5 text-start sm:text-left">
              <h3 className="text-lg font-semibold leading-none tracking-tight sm:text-xl">
                Video Details
              </h3>
              <p className="text-sm text-muted-foreground">
                Edit video details here.
              </p>
            </div>

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
                      Publish
                    </label>
                    <FormDescription>
                      Select whether your video should be published or not.
                    </FormDescription>

                    <FormField
                      name="publish"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="whitespace-nowrap px-3 py-5 text-sm text-primary/70">
                              <Switch
                                checked={field.value}
                                onChange={field.onChange}
                                className={`${
                                  form.getValues("publish")
                                    ? "bg-foreground dark:bg-secondary"
                                    : "bg-gray-200"
                                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2`}
                              >
                                <span
                                  className={`${
                                    form.getValues("publish")
                                      ? "translate-x-5 bg-secondary dark:bg-primary"
                                      : "translate-x-0 bg-primary"
                                  } pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`}
                                ></span>
                              </Switch>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-full mt-2">
                    <label className="block text-sm font-medium leading-6 text-primary">
                      Thumbnail
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Select or upload an image that shows the content of your
                      video. A good thumbnail will look unique and attract the
                      attention of the audience.
                    </p>

                    {freshVideoData?.thumbnailUrl && (
                      <div className="my-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4">
                          <Card>
                            <CardContent className="p-2">
                              <div className="relative">
                                <Thumbnail
                                  thumbnailUrl={freshVideoData.thumbnailUrl}
                                  title={freshVideoData.title}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

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
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <p>Saving...</p>
                          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        router.push(`/dashboard`);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
