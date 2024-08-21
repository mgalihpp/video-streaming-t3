import { cn } from "@/lib/utils";

export function VideoTitle({
  title,
  limitHeight,
  limitSize,
  className,
}: {
  title: string;
  className?: string;
  limitHeight?: boolean;
  limitSize?: boolean;
}) {
  return (
    <h3
      className={cn(
        `break-all text-lg font-semibold leading-6 text-primary group-hover:text-gray-600`,
        {
          "text-base": limitSize,
          "max-h-12 w-full overflow-hidden overflow-ellipsis": limitHeight,
        },
        className,
      )}
    >
      {title}
    </h3>
  );
}
