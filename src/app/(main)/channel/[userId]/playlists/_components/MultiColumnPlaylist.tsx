import { Thumbnail } from "@/components/video/Thumbnail";
import moment from "moment";
import Link from "next/link";
import { type ReactNode } from "react";

interface PlaylistProps {
  playlists: {
    id: string;
    title: string;
    description?: string;
    videoCount: number;
    playlistThumbnail: string;
    createdAt: Date;
  }[];
  children?: React.ReactNode;
}

export function MultiColumnPlaylist({ playlists }: PlaylistProps) {
  return (
    <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-8 md:mx-0 md:max-w-none md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:m-0 xl:grid-cols-2 2xl:m-0 2xl:max-w-none 2xl:grid-cols-3">
      {playlists.map((playlist) => (
        <Link
          key={playlist.id}
          href={`/playlist/${playlist.id}`}
          className="flex flex-col items-start justify-between rounded-2xl bg-background/20 hover:bg-secondary/30"
        >
          <SinglePlaylist
            playlist={{
              id: playlist.id,
              title: playlist.title,
              description: playlist.description,
              videoCount: playlist.videoCount,
              playlistThumbnail: playlist.playlistThumbnail,
              createdAt: playlist.createdAt,
            }}
          >
            <p className="text-regular mt-2 max-h-12 overflow-hidden text-primary/80">
              {playlist.description}
            </p>
          </SinglePlaylist>
        </Link>
      ))}
    </div>
  );
}

export function SinglePlaylist({
  playlist,
  children,
}: {
  playlist: {
    id: string;
    title: string;
    description?: string | null;
    videoCount: number;
    playlistThumbnail: string;
    createdAt: Date;
  };
  children?: ReactNode;
}) {
  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Thumbnail
          thumbnailUrl={playlist.playlistThumbnail}
          title={playlist.title}
        />
        <div className="absolute inset-x-0 bottom-0 max-h-32 rounded-b-2xl bg-gray-500 bg-opacity-60 backdrop-blur-lg">
          <div className="m-6">
            <div className="mt-2 flex place-content-between items-start gap-x-2 text-sm font-semibold text-white">
              <p>Playlist</p>
              <p>
                {playlist.videoCount}
                <span> Videos</span>
              </p>
            </div>
            <div className="mt-2 flex items-start gap-x-2">
              <p className="text-sm text-white">
                {moment(playlist.createdAt).fromNow()}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-lg">
        <div className="items-top relative mt-4 flex gap-x-4">
          <div className="mb-4 w-full px-4">
            <div className="w-100 flex">
              <h3 className="h-auto w-full text-2xl font-medium text-primary group-hover:text-primary/90">
                {playlist.title}
              </h3>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
