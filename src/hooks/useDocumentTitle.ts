import { useEffect } from "react";

interface DocumentTitleProps {
  title?: string;
  description?: string;
}

const useDocumentTitle = ({ title, description }: DocumentTitleProps): void => {
  useEffect(() => {
    document.title = title ?? "YourTube"; // Set the title
    const metaDescription = document.querySelector('meta[name="description"]');

    if (metaDescription instanceof HTMLMetaElement) {
      metaDescription.content =
        description ??
        `Welcome to YourTube - Your go-to platform for amazing videos!
  Discover a world of content with our incredible features. Enjoy seamless streaming, 
  personalized recommendations, and much more. Download YourTube now and embark on a visual journey 
  like never before!`; // Set the description
    } else {
      // Create a meta tag if it doesn't exist
      const newMetaTag = document.createElement("meta");
      newMetaTag.name = "description";
      newMetaTag.content =
        description ??
        `Welcome to YourTube - Your go-to platform for amazing videos!
  Discover a world of content with our incredible features. Enjoy seamless streaming, 
  personalized recommendations, and much more. Download YourTube now and embark on a visual journey 
  like never before!`;
      document.head.appendChild(newMetaTag);
    }

    // Clean up the side effect
    return () => {
      document.title = "YourTube"; // Reset the title
      if (metaDescription instanceof HTMLMetaElement) {
        metaDescription.content = `Welcome to YourTube - Your go-to platform for amazing videos!
  Discover a world of content with our incredible features. Enjoy seamless streaming, 
  personalized recommendations, and much more. Download YourTube now and embark on a visual journey 
  like never before!`; // Reset the description
      }
    };
  }, [title, description]); // Re-run effect when title or description changes
};

export default useDocumentTitle;
