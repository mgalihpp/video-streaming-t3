import { cn } from "@/lib/utils";
import Image from "next/image";

export function UserImage({
  image,
  className = "",
}: {
  image: string;
  className?: string;
}) {
  return (
    <div className={cn("relative max-h-9 min-h-9 min-w-9 max-w-9", className)}>
      <Image
        src={image}
        alt="user image"
        className="absolute rounded-full"
        loading="lazy"
        fill
      />
    </div>
  );
}
