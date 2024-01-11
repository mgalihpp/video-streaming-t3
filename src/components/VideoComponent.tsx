import Image from "next/image";

export function UserImage({
  image,
  className = "",
}: {
  image: string;
  className?: string;
}) {
  return (
    <div className={`relative min-h-9 min-w-9 ${className}`}>
      <Image
        src={image}
        alt="user image"
        className="absolute rounded-full"
        fill
      />
    </div>
  );
}
