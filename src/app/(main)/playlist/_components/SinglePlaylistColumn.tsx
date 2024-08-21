import { VideoDescription } from "@/components/video/VideoDescription";
import { PlaylistCard } from "./PlaylistCard";
import Link from "next/link";
import { UserImage } from "@/components/video/VideoUserImage";
import { SmallSingleColumnVideo } from "@/components/video/SmallSingleColumnVideo";

interface PlaylistPageProps {
  playlist: {
    id: string;
    title: string;
    description: string;
    videoCount: number;
    playlistThumbnail: string;
    createdAt: Date;
  };
  videos: {
    id: string;
    title: string;
    thumbnailUrl: string;
    createdAt: Date;
    views: number;
    videoUrl: string;
    user: {
      name: string | null;
      image: string | null;
    };
  }[];
  user: {
    id: string;
    image?: string | null;
    name?: string | null;
    followers: number;
  };
}


export const SinglePlaylistColumn: React.FC<PlaylistPageProps> = ({
  playlist,
  user,
  videos,
}) => {
  if (!playlist ?? !videos ?? !videos ?? !user) {
    return <></>;
  }

  return (
    <>
      <div className="mx-auto gap-4 lg:flex">
        <div className="lg:w-2/3">
          <PlaylistCard playlist={playlist} />
          <div className="px-4">
            <VideoDescription text={playlist.description} length={250} border />
          </div>
          <div className="flex flex-row place-content-between gap-x-4 px-4">
            <Link href={`/channel/${user.id}`}>
              <div className="mt-4 flex flex-row items-center gap-2">
                <UserImage image={user.image ?? ""} />
                <div className="flex flex-col justify-center">
                  <p className="w-max text-sm font-semibold leading-6 text-primary">
                    {user.name}
                  </p>
                  <p className="text-xs text-primary/80">
                    {user.followers}
                    <span> Followers</span>
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="mt-4 border-b border-gray-200 dark:border-secondary" />
        <div className="lg:w-1/3">
          <SmallSingleColumnVideo
            videos={videos
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((video) => ({
                ...video,
              }))}
            users={videos
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .map((video) => video.user)}
          />
        </div>
      </div>
    </>
  );
};
