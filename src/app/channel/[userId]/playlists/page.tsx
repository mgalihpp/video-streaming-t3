import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { ErrorMessage, MultiColumnPlaylist } from "@/components";

const ChannelPlaylistsPage = async ({ params }: {params: {userId: string}}) => {
  const session = await getServerAuthSession();

  const { playlists } = await api.playlist.getPlaylistByUserId.query(
    params.userId,
  );

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
            id: playlist.id,
            title: playlist.title,
            description: playlist.description,
            videoCount: playlist.videoCount,
            playlistThumbnail: playlist.playlistThumbnail ?? "",
            createdAt: playlist.createdAt,
          }))}
        />
      )}
    </>
  );
};

export default ChannelPlaylistsPage;
