"use client";

import { useRef } from "react";
import { Cropper } from "react-cropper";
import { Button } from "./ui/button";
import "cropperjs/dist/cropper.css";

export function ImageCropper({
  image,
  setCroppedImage,
  handleSubmit,
  imageType,
  setCurrentPage,
  setOpen,
}: {
  setCurrentPage?: (page: boolean) => void;
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
    setCurrentPage ? setCurrentPage(false) : null;
  };
  const cancelCrop = () => {
    setCurrentPage ? setCurrentPage(false) : null;
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
