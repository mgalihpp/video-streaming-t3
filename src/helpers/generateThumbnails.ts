export function generateThumbnails(
  fileToUpload: File | FileList | string | null,
  interval = 30,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!fileToUpload) {
      return reject(new Error("No file provided."));
    }

    let file: File | null = null;

    if (fileToUpload instanceof File) {
      file = fileToUpload;
      processFile(file);
    } else if (fileToUpload instanceof FileList) {
      file = fileToUpload[0]!;
    } else if (typeof fileToUpload === "string") {
      // Handle case where the input is a URL or path
      fetch(fileToUpload)
        .then((response) => response.blob())
        .then((blob) => {
          file = new File([blob], "video.mp4", { type: blob.type });
          processFile(file);
        })
        .catch((error) => reject(error));
      return;
    } else {
      return reject(new Error("Invalid file input."));
    }

    function processFile(file: File) {
      // Create a video element
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);

      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          return reject(new Error("Failed to get canvas context."));
        }

        const thumbnails: string[] = [];
        const duration = video.duration;
        let numThumbnails: number;

        if (duration <= 30) {
          numThumbnails = 1;
        } else {
          numThumbnails = Math.ceil(duration / interval);
        }

        function extractFrame(time: number): Promise<string> {
          return new Promise((resolve) => {
            video.currentTime = time;
            video.addEventListener("seeked", function seekHandler() {
              video.removeEventListener("seeked", seekHandler);
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context?.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbnail = canvas.toDataURL("image/jpeg");
              resolve(thumbnail);
            });
          });
        }

        async function generateThumbnails() {
          for (let i = 0; i < numThumbnails; i++) {
            const time = i * interval;
            if (time > duration) break;
            const thumbnail = await extractFrame(time);
            thumbnails.push(thumbnail);
          }
          // Clean up
          URL.revokeObjectURL(video.src);
          resolve(thumbnails);
        }

        generateThumbnails().catch(reject);
      });

      video.addEventListener("error", (error) => {
        reject(error);
      });
    }
  });
}
