import { generateThumbnails } from "@/helpers/generateThumbnails";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type DragEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface onUploadProps {
  cb?: (step: number) => void;
  fileToUpload: File | FileList | string | null;
  data?: {
    id: string;
    title: string;
    description: string;
    publish: boolean;
  };
  refetch?: () => unknown;
  updateParams?: boolean;
}

export function useVideoUpload() {
  const [uploadFile, setUploadFile] = useState<File | FileList | null>(null);
  const [uploadImageFile, setUploadImageFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const router = useRouter();

  const { mutate: addNewVideo, isPending: uploadPending } =
    api.video.addNewVideo.useMutation();

  const { mutate: updateVideo } = api.video.updateVideo.useMutation();

  useEffect(() => {
    console.log("Cropped Image Updated:", croppedImage);
  }, [croppedImage]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0] ? e.target.files[0] : null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
      setUploadFile(files[0]!);
    }
  };

  const generateUniqueUploadId = () => {
    return `uqid-${Date.now()}`;
  };

  const onUpload = async ({
    cb,
    fileToUpload,
    data,
    refetch,
    updateParams,
  }: onUploadProps) => {
    type UploadResponse = {
      secure_url: string;
      eager: [
        {
          transformation: string;
          bytes: number;
          forma: string;
          url: string;
          secure_url: string;
        },
      ];
    };

    if (!fileToUpload) toast.error("Please select a file to upload");

    setUploadProgress(0);
    setIsUploading(true);

    const uniqueUploadId = generateUniqueUploadId();
    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil((fileToUpload as File).size / chunkSize);
    let currentChunk = 0;

    const uploadChunk = async (start: number, end: number) => {
      const formData = new FormData();
      if (fileToUpload instanceof File) {
        if (fileToUpload.type.includes("video/mp4")) {
          formData.append("upload_preset", "ml_video");
        } else if (fileToUpload.type.includes("image/")) {
          formData.append("upload_preset", "ml_image");
        } else {
          toast.error("File type not supported");
          return;
        }
      } else if (typeof fileToUpload === "string") {
        toast.error("File type not supported");
        return;
      }

      formData.append("file", (fileToUpload as File).slice(start, end));
      const contentRange = `bytes ${start}-${end - 1}/${
        (fileToUpload as File).size
      }`;

      console.log(
        `Uploading chunk for file: ${
          (fileToUpload as File).name
        }; start: ${start}, end: ${end - 1}`,
      );

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/ddhvywd6h/auto/upload",
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
          console.error("Error uploading chunk:", response.statusText);
        }

        currentChunk++;
        const progress = Math.round((currentChunk / totalChunks) * 100);
        setUploadProgress(progress);

        if (currentChunk < totalChunks) {
          const nextStart = currentChunk * chunkSize;
          const nextEnd = Math.min(
            nextStart + chunkSize,
            (fileToUpload as File).size,
          );
          await uploadChunk(nextStart, nextEnd);
        } else {
          setUploadProgress(100);

          const fetchResponse = (await response.json()) as UploadResponse;

          if (fetchResponse.eager) {
            const newVideoData = {
              videoUrl: fetchResponse.eager[0].secure_url,
            };

            addNewVideo(newVideoData, {
              onSuccess: (data) => {
                setUploadFile(null);
                setIsUploading(false);

                toast.success("Video uploaded successfully");

                generateThumbnails(fileToUpload, 30)
                  .then((thumbnails) => {
                    const res = fetch(`/api/upload/${data?.id}`, {
                      method: "POST",
                      body: JSON.stringify(thumbnails),
                    }).catch((err) => {
                      console.error((err as Error).message);
                    });
                    return res;
                  })
                  .catch(() => {
                    toast.error("Error when generating thumbnails");
                  });

                setTimeout(() => {
                  cb?.(2);
                  router.push(`?vId=${data.id}&step=2`);
                }, 2000);
              },
              onError: (err) => {
                toast.error(`Error when uploading video: ${err.message}`);
              },
            });
          } else {
            const thumbnailUrl = fetchResponse.secure_url;
            setCroppedImage(null);
            setUploadImageFile(null);
            setIsUploading(false);

            toast.success("Image uploaded successfully");

            if (!data) return;

            const updateVideoData = {
              thumbnailUrl: thumbnailUrl,
              ...data,
            };

            updateVideo(updateVideoData, {
              onSuccess: () => {
                toast.success("Video updated successfully");
                refetch?.();

                setTimeout(() => cb?.(3), 2000);

                if (updateParams) {
                  router.push(`?vId=${data.id}&step=3&completed=1`);
                }
              },
              onError: (err) => {
                toast.error(`Error when updating video: ${err.message}`);
              },
            });
          }
        }
      } catch (error) {
        setUploadProgress(0);
        setIsUploading(false);

        toast.error("Error uploading chunk");
        console.error((error as Error).message);
      }
    };

    const starts = 0;
    const ends = Math.min(chunkSize, (fileToUpload as File).size);
    await uploadChunk(starts, ends);
  };

  return {
    uploadFile,
    setUploadFile,
    uploadImageFile,
    setUploadImageFile,
    croppedImage,
    setCroppedImage,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
    uploadError,
    setUploadError,
    onFileChange,
    handleDrop,
    generateUniqueUploadId,
    addNewVideo,
    uploadPending,
    onUpload,
  };
}
