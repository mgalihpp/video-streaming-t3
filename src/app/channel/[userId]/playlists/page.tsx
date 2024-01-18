import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { ErrorMessage, MultiColumnPlaylist } from "@/components";

const ChannelPlaylistsPage = async ({ params }: {params: {userId: string}}) => {
  const session = await getServerAuthSession();

  const { playlists } = await api.playlist.getPlaylistByUserId.query(
    params.userId,
  );

  const errorType = !playlists ?? playlists.length < 0;

  const Error = () => {
    if (params.userId === session?.user.id && playlists.length < 0) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Playlists Created"
          description="You have not yet created a playlist inside your library."
        />
      );
    } else if (errorType) {
      return (
        <ErrorMessage
          icon="Play"
          message="Something wrong"
          description="Something went wrong in server."
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {errorType ? (
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
