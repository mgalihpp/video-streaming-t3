import Link from "next/link";
import React, { type ReactNode } from "react";
import {
  SmallSingleColumnVideo,
  Thumbnail,
  UserImage,
  VideoDescription,
} from "..";
import moment from "moment";

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
  }[];
  authors: {
    id: string;
    name: string;
    image: string;
  }[];
  user: {
    id: string;
    image: string;
    name: string;
    followers: number;
  };
}

interface PlaylistProps {
  playlists: {
    id: string;
    title: string;
    description?: string | null;
    videoCount: number;
    playlistThumbnail: string;
    createdAt: Date;
  }[];
  children?: React.ReactNode;
}

export const SinglePlaylistWithVideo: React.FC<PlaylistPageProps> = ({
  authors,
  playlist,
  user,
  videos,
}) => {
  if (!playlist ?? !videos ?? !videos ?? !user) {
    return <></>;
  }

  return (
    <>
      <main className="mx-auto gap-4 lg:flex">
        <div className="lg:w-1/2 lg:px-0 lg:pl-6">
          <SinglePlaylist playlist={playlist} />
          <VideoDescription text={playlist.description} length={250} border />
          <div className="flex flex-row place-content-between gap-x-4">
            <Link href={`/channel/${user.id}`}>
              <div className="mt-4 flex flex-row gap-2 items-center">
                <UserImage image={user.image} />
                <div className="flex flex-col justify-center">
                  <p className="w-max text-sm font-semibold leading-6 text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user.followers}
                    <span> Followers</span>
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="border-b border-gray-200 mt-4" />
        <div className="gap-4 lg:w-1/2 lg:px-0 lg:pr-6">
          <SmallSingleColumnVideo
            videos={videos.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )}
            users={authors}
          />
        </div>
      </main>
    </>
  );
};

export function MultiColumnPlaylist({ playlists }: PlaylistProps) {
  return (
    <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-8 md:mx-0 md:max-w-none md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:m-0 xl:grid-cols-2 2xl:m-0 2xl:max-w-none 2xl:grid-cols-3">
      {playlists.map((playlist) => (
        <Link
          key={playlist.id}
          href={`/playlist/${playlist.id}`}
          className="flex flex-col items-start justify-between hover:bg-gray-100 rounded-2xl"
        >
          <SinglePlaylist playlist={playlist}>
            <p className="text-regular mt-2 max-h-12 overflow-hidden text-gray-600">
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
        <Thumbnail thumbnailUrl={playlist?.playlistThumbnail} />
        <div className="absolute inset-x-0 bottom-0 max-h-32 rounded-b-2xl bg-gray-500 bg-opacity-60 backdrop-blur-lg">
          <div className="m-6">
            <div className="mt-2 flex place-content-between items-start  gap-x-2 text-sm font-semibold text-white">
              <p>Playlist</p>
              <p>
                {playlist.videoCount}
                <span> Videos</span>
              </p>
            </div>
            <div className="mt-2 flex items-start gap-x-2 ">
              <p className="text-sm text-white">
                {moment(playlist.createdAt).fromNow()}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-lg">
        <div className="items-top relative mt-4 flex gap-x-4 ">
          <div className=" w-full mb-4 px-4">
            <div className=" w-100 flex ">
              <h3 className="h-auto w-full text-2xl font-medium text-gray-900 group-hover:text-gray-600">
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
