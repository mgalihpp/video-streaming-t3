import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { MultiColumnPlaylist } from "./_components/MultiColumnPlaylist";
import { ErrorMessage } from "@/components/ErrorMessage";
// import { ErrorMessage, MultiColumnPlaylist } from "@/components";

const ChannelPlaylistsPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const session = await getServerAuthSession();

  const playlists = await api.playlist.getPlaylistByUserId({
    userId: params.userId,
  });

  const Error = () => {
    if (params.userId === session?.user.id && playlists.length <= 0) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Playlists Created"
          description="You have not yet created a playlist inside your library."
        />
      );
    } else if (playlists.length <= 0) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Playlist found"
          description="This user channel doesn't have any playlist."
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {playlists.length <= 0 ? (
        <Error />
      ) : (
        <MultiColumnPlaylist
          playlists={playlists.map((playlist) => ({
            id: playlist.id ?? "",
            title: playlist.title ?? "",
            description: playlist.description ?? "",
            videoCount: playlist.PlaylistHasVideo.length ?? 0,
            playlistThumbnail:
              playlist.PlaylistHasVideo[0]?.video?.thumbnailUrl ??
              "https://res.cloudinary.com/ddhvywd6h/image/upload/v1723974681/qw7lplxygrqjjmhcody3.png",
            createdAt: playlist.createdAt,
          }))}
        />
      )}
    </>
  );
};

export default ChannelPlaylistsPage;
