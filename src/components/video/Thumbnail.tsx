import React from "react";
import Image from "next/image";

export function Thumbnail({
  thumbnailUrl,
  title,
}: {
  thumbnailUrl: string;
  title: string;
}) {
  return (
    <Image
      src={thumbnailUrl}
      alt={`Video Thumbnail of ${title}`}
      width="426"
      height="240"
      className="aspect-video w-full rounded-lg object-cover"
    />
  );
}
