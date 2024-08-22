import { type RefObject, useEffect, useState } from "react";

export function useImagePreloader(ref: RefObject<HTMLImageElement>) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const imgElement = ref.current;
    if (imgElement) {
      const handleLoad = () => setImageLoaded(true);

      // Check if the image is already loaded
      if (imgElement.complete) {
        handleLoad();
      } else {
        imgElement.addEventListener("load", handleLoad);
      }

      return () => {
        imgElement.removeEventListener("load", handleLoad);
      };
    }
  }, [ref]);

  return imageLoaded;
}
