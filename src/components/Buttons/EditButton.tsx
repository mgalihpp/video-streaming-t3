"use client";

import { type ChangeEvent, useRef, useState, type DragEvent } from "react";
import { Edit } from "../Icons/Icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { api } from "@/trpc/react";
import "cropperjs/dist/cropper.css";
import { env } from "@/env";
import { useDispatch, useSelector } from "react-redux";
import { closeDialog, openDialog, selectDialogState } from "@/store/editDialog";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { ImageCropper } from "@/components";

interface EditButtonProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
  };
  refetch: () => Promise<unknown>;
}

export default function EditButton({ video, refetch }: EditButtonProps) {
  const dispatch = useDispatch();
  const dialogState = useSelector(selectDialogState);
  const [disable, setDisable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [image, setImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const [inputData, setInputData] = useState({
    title: video.title,
    description: video.description,
  });

  const { toast } = useToast();

  const cloudinaryName = env.NEXT_PUBLIC_CLOUDINARY_NAME ?? "";

  const updateVideoMutation = api.video.updateVideo.useMutation();

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      dispatch(openDialog(video.id));
    } else {
      dispatch(closeDialog(video.id));
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setInputData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0] ? e.target.files[0] : null);
      setCurrentPage(2);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
      setImage(files[0]!);
      setCurrentPage(2);
    }
  };

  const handleSubmit = async () => {
    type UploadResponse = {
      secure_url: string;
    };

    setDisable(true);

    const videoData = {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
    };

    const formData = new FormData();
    formData.append("upload_preset", "user_uploads");
    formData.append("file", croppedImage!);

    fetch(
      "https://api.cloudinary.com/v1_1/" + cloudinaryName + "/image/upload",
      {
        method: "POST",
        body: formData,
      },
    )
      .then((response) => response.json() as Promise<UploadResponse>)
      .then((data) => {
        if (
          inputData.title !== video.title ||
          inputData.description !== video.description ||
          data.secure_url !== undefined
        ) {
          const newVideoData = {
            ...videoData,
            ...(data.secure_url && { thumbnailUrl: data.secure_url }),
          };
          if (inputData.title !== video.title)
            newVideoData.title = inputData.title;
          if (inputData.description !== video.description)
            newVideoData.description = inputData.description;

          updateVideoMutation.mutate(newVideoData, {
            onSuccess: () => {
              dispatch(closeDialog(video.id));
              setCroppedImage(null);
              setDisable(false);
              toast({
                title: "Update Successfully",
                variant: "success",
              });
              void refetch();
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
    <Dialog
      open={dialogState.openVideos[video.id]}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon">
          <Edit className="h-5 w-5 shrink-0 stroke-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-scroll">
        {currentPage === 1 && (
          <>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-left sm:mt-0">
                <DialogHeader>
                  <DialogTitle>Edit Video</DialogTitle>
                  <DialogDescription>
                    Update your video here don&apos;t forget to save after
                    change.
                  </DialogDescription>
                </DialogHeader>
                <div className="col-span-full mt-2">
                  <label
                    htmlFor="thumbnail"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
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
                        <img src={croppedImage} alt="cropped" />
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
                                onChange={onFileChange}
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
                <div className="mt-2 flex flex-col">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Title
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Edit video title.
                  </p>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={inputData.title}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-secondary sm:text-sm sm:leading-6"
                  />
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium leading-6 text-primary"
                  >
                    Description
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Edit video description.
                  </p>
                  <textarea
                    rows={4}
                    name="description"
                    id="description"
                    value={inputData.description}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-md border-0 p-2 py-1.5 text-primary shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-secondary sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
            <div className="relative mt-5 flex flex-row-reverse gap-2 sm:mt-4">
              <Button disabled={disable} onClick={handleSubmit}>
                {disable ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                disabled={disable}
                variant="outline"
                onClick={() => dispatch(closeDialog(video.id))}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
        {currentPage === 2 && (
          <>
            <ImageCropper
              image={image}
              setCroppedImage={setCroppedImage}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
