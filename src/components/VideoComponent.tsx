import Image from "next/image";
import Link from "next/link";
import { Thumbnail } from ".";
import { cn } from "@/lib/utils";
import moment from "moment";
interface VideoComponentProps {
  videos: {
    id: string;
    title: string;
    thumbnailUrl: string;
    createdAt: Date;
    views: number;
  }[];
  users: {
    name: string | null;
    image: string | null;
  }[];
  refetch?: () => Promise<unknown>;
}

export const MultiColumnVideo: React.FC<VideoComponentProps> = ({
  videos,
  users,
}) => {
  return (
    <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-8 md:mx-0 md:max-w-none md:grid-cols-2 lg:mx-0 lg:grid-cols-3 xl:mx-0 xl:max-w-none 2xl:mx-0 2xl:max-w-none 2xl:grid-cols-3">
      {videos.map((video, index) => {
        const user = users[index];
        if (!user) {
          return null;
        }

        return (
          <Link
            key={video.id}
            // nanti ganti ini jadi search params /video?watch=videoid
            href={`/video?watch=${video.id}`}
            className="flex flex-col items-start justify-between hover:bg-gray-100"
          >
            <div className="relative w-full">
              <Thumbnail thumbnailUrl={video.thumbnailUrl} />
              <div className="max-w-xl">
                <div className="relative mt-4 flex gap-x-4">
                  <UserImage image={user.image!} />
                  <div className="w-full">
                    <VideoTitle title={video.title} limitHeight={true} />
                    <VideoInfo
                      views={video.views}
                      createdAt={video.createdAt}
                    />
                    <VideoUserName name={user.name!} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export const SingleColumnVideo: React.FC<VideoComponentProps> = ({
  videos,
  users,
}) => (
  <div>
    {videos.map((video, index) => {
      const user = users[index];
      if (!user) {
        return null;
      }
      return (
        <Link href={`/video?watch=${video.id}`} key={video.id}>
          <div className="my-5 flex flex-col gap-4 hover:bg-gray-100 lg:flex-row">
            <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:w-64 lg:shrink-0">
              <Thumbnail thumbnailUrl={video.thumbnailUrl} />
            </div>
            <div>
              <VideoTitle title={video.title} />
              <VideoInfo views={video.views} createdAt={video.createdAt} />

              <div className="relative mt-2 flex flex-row items-center gap-x-4">
                <UserImage image={user.image!} />
                <VideoUserName name={user.name!} />
              </div>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
);

export function VideoTitle({
  title,
  limitHeight,
  limitSize,
}: {
  title: string;
  limitHeight?: boolean;
  limitSize?: boolean;
}) {
  return (
    <h1
      className={cn(
        `max-w-md text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600`,
        {
          "text-base": limitSize,
          "max-h-12 w-full overflow-hidden": limitHeight,
        },
      )}
    >
      {title}
    </h1>
  );
}

export function VideoInfo({
  views,
  createdAt,
}: {
  views: number;
  createdAt: Date | string;
}) {
  return (
    <div className="mt-1 flex max-h-6 items-start overflow-hidden text-sm">
      <p className="text-gray-600">
        {views}
        <span>Views</span>
      </p>
      <li className="pl-2 text-sm text-gray-500">
        {moment(createdAt).fromNow()}
      </li>
    </div>
  );
}

export function VideoUserName({ name }: { name: string }) {
  return (
    <p className="max-h-5 overflow-hidden text-sm font-semibold leading-6 text-gray-600">
      {name}
    </p>
  );
}

export function UserImage({
  image,
  className = "",
}: {
  image: string;
  className?: string;
}) {
  return (
    <div className={`relative max-h-9 min-h-9 min-w-9 max-w-9 ${className}`}>
      <Image
        src={image}
        alt="user image"
        className="absolute rounded-full"
        fill
      />
    </div>
  );
}
