"use client";

import { type ChangeEvent, useRef, useState } from "react";
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
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { env } from "@/env";

interface EditButtonProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
  };
}

export default function EditButton({ video }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [disable, setDisable] = useState(false);
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);

  const [image, setImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const [inputData, setInputData] = useState({
    title: video.title,
    description: video.description,
  });

  const cloudinaryName = env.NEXT_PUBLIC_CLOUDINARY_NAME ?? "";

  const updateVideoMutation = api.video.updateVideo.useMutation();

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
              setOpen(false);
              setCroppedImage(null);
              setDisable(false);
              router.refresh();
            },
          });
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon">
          <Edit className="mr-2 h-5 w-5 shrink-0 stroke-gray-600" />
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
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Thumbnail
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Select or upload an image that shows the content of your
                    video. A good thumbnail will look unique and attract the
                    attention of the audience.
                  </p>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                      {croppedImage ? (
                        <img src={croppedImage} alt="cropped" />
                      ) : (
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
                          <p className="text-xs leading-5 text-gray-600">
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
                    className="block text-sm font-medium leading-6 text-gray-900"
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
                    className="mt-2 block w-full rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium leading-6 text-gray-900"
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
                    className="mt-2 block w-full rounded-md border-0 p-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
            <div className="relative mt-5 flex flex-row-reverse gap-2 sm:mt-4">
              <Button disabled={disable} onClick={handleSubmit}>
                Save
              </Button>
              <Button
                disabled={disable}
                variant="outline"
                onClick={() => setOpen(false)}
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

export function ImageCropper({
  image,
  setCroppedImage,
  handleSubmit,
  imageType,
  setCurrentPage,
  setOpen,
}: {
  setCurrentPage?: (page: number) => void;
  setCroppedImage: (image: string | null) => void;
  image: File | null | string;
  handleSubmit?: (croppedDataUrl: string) => void;
  imageType?: "backgroundImage" | "image";
  setOpen?: (open: boolean) => void;
}) {
  interface CropperImageElement extends HTMLImageElement {
    cropper?: Cropper;
  }

  const cropperRef = useRef<CropperImageElement>(null);

  const cropImage = () => {
    if (cropperRef.current && cropperRef.current !== null) {
      const imageElement: CropperImageElement | null = cropperRef.current;
      const cropper: Cropper | undefined = imageElement.cropper;
      if (cropper) {
        const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
        setCroppedImage(croppedDataUrl);
        handleSubmit ? handleSubmit(croppedDataUrl) : null;
      }
    }
  };

  const completeCrop = () => {
    cropImage();
    setCurrentPage ? setCurrentPage(1) : null;
  };
  const cancelCrop = () => {
    setCurrentPage ? setCurrentPage(1) : null;
    setOpen ? setOpen(false) : null;
  };

  return (
    <div className="sm:flex sm:items-start">
      <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
        {image && (
          <div className="mt-5">
            <Cropper
              ref={cropperRef}
              src={image instanceof File ? URL.createObjectURL(image) : image}
              style={{ height: "100%", width: "100%" }}
              aspectRatio={imageType === "image" ? 1 : 16 / 9}
              guides
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={cancelCrop}>
                Cancel
              </Button>
              <Button onClick={completeCrop}>Crop Image</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
