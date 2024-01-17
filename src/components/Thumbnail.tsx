import React from "react";
import Image from "next/image";

export function Thumbnail({
  thumbnailUrl,
  className,
}: {
  thumbnailUrl: string;
  className?: string;
}) {
  return (
    <div className="relative inset-0 h-0 w-full pb-[50%]">
      <Image
        src={thumbnailUrl ?? "/background.jpg"}
        alt="thumbnail"
        fill
        priority
        className={`absolute rounded-2xl inset-0 left-0 top-0 ${className}`}
      />
    </div>
  );
}
