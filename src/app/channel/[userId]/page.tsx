import { ErrorMessage, MultiColumnVideo } from "@/components";
import { buttonVariants } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import Plus from "@/components/Icons/Plus";

const ChannelPage = async ({ params }: { params: { userId: string } }) => {
  const session = await getServerAuthSession();
  const { videos, users } = await api.video.getVideoByUserId.query(
    params.userId,
  );

  const Error = () => {
    if (params.userId == session?.user.id && videos.length < 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <ErrorMessage
            icon="Play"
            message="No Video Uploaded"
            description="Click to upload new video. You have yet to upload a video."
          />

          <Link href="/dashboard" className={buttonVariants()}>
            <Plus className="mr-2 h-5 w-5 shrink-0 stroke-white" />
            Upload Video
          </Link>
        </div>
      );
    } else if (videos.length < 0) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Video Avaliable"
          description="Profile has no videos uploaded."
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {videos.length < 0 ? (
        <Error />
      ) : (
        <MultiColumnVideo
          videos={
            videos?.map((video) => ({
              id: video?.id ?? "",
              title: video?.title ?? "",
              thumbnailUrl: video?.thumbnailUrl ?? "",
              createdAt: video?.createdAt ?? new Date(),
              views: video?.views ?? 0,
            })) ?? []
          }
          users={
            users?.map((user) => ({
              name: user?.name ?? "",
              image: user?.image ?? "",
            })) ?? []
          }
        ></MultiColumnVideo>
      )}
    </>
  );
};

export default ChannelPage;
