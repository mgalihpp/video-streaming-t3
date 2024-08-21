import { Skeleton } from "@/components/ui/skeleton";
import VideoCard from "./VideoCard";

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video, index) => {
        const user = users[index];
        if (!user) {
          return null;
        }

        return (
          <VideoCard
            key={video.id}
            videoId={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            userImage={user.image!}
            userName={user.name!}
            views={video.views}
            createdAt={video.createdAt}
          />
        );
      })}
    </div>
  );
};

export const MultiColumnVideoSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex h-fit w-full flex-col">
          <Skeleton className="aspect-video rounded-2xl" />
          <div className="mt-4 flex h-[92px] max-h-[92px] max-w-xl flex-row space-x-2 max-sm:px-2">
            <Skeleton className="max-h-9 min-h-9 min-w-9 max-w-9 rounded-full" />
            <div className="flex h-full w-full flex-col space-y-2">
              <Skeleton className="h-2/5 w-full" />
              <Skeleton className="h-1/5 w-full" />
              <Skeleton className="h-1/5 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
