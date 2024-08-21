import moment from "moment";
import { VideoDescription } from "./VideoDescription";

export function VideoInfo({
  views,
  createdAt,
  text,
  length,
  border,
}: {
  views: number;
  createdAt: Date | string;
  text?: string;
  length?: number;
  border?: boolean;
}) {
  return (
    <div className="mt-1 flex min-h-6 flex-col items-start overflow-hidden text-sm">
      <div className="flex flex-row flex-nowrap">
        <p className="flex flex-nowrap text-xs text-primary/80 gap-1">
          {views} <span>Views</span>
        </p>
        <li className="flex flex-nowrap pl-2 text-xs text-primary/80">
          {moment(createdAt).fromNow()}
        </li>
      </div>

      {text && length && (
        <VideoDescription text={text} length={length} border={border} />
      )}
    </div>
  );
}
