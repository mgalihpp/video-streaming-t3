import SmallVideoCard from "./SmallVideoCard";

interface VideoComponentProps {
  videos: {
    id: string;
    title: string;
    thumbnailUrl: string;
    createdAt: Date;
    views: number;
    start?: number;
  }[];
  users: {
    name: string | null;
    image: string | null;
  }[];
  refetch?: () => Promise<unknown>;
  playlistId?: string;
}

export const SmallSingleColumnVideo: React.FC<VideoComponentProps> = ({
  videos,
  users,
  playlistId,
}) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {videos.map((video, index) => {
        const user = users[index];
        if (!user) {
          return null;
        }

        return (
          <SmallVideoCard
            key={index}
            videoId={video.id}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
            userImage={user.image!}
            userName={user.name!}
            views={video.views}
            createdAt={video.createdAt}
            playlist={{ id: playlistId ?? "", start: (video.start ?? 0) + 1 }}
          />
        );
      })}
    </div>
  );
};
