import VideoCard from "@/components/video/VideoCard";

interface MultiColumnTrenPlaylistProps {
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
}

export default function MultiColumnTrenPlaylist({
  videos,
  users,
}: MultiColumnTrenPlaylistProps) {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Trending Playlists</h1>
        <p className="text-muted-foreground">
          Discover the latest and greatest videos on our platform.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
}
