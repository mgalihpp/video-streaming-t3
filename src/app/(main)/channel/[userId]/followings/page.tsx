import { api } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import { UserImage } from "@/components/video/VideoUserImage";
import FollowButton from "@/components/button/FollowButton";
import { ErrorMessage } from "@/components/ErrorMessage";
// import { ErrorMessage, FollowButton, UserImage } from "@/components";

const ChannelFollowingsPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const session = await getServerAuthSession();

  const { followings } = await api.user.getUsersFollowing({
    id: params.userId,
    viewerId: session?.user.id ?? "",
  });

  const Error = () => {
    if (params.userId === session?.user.id && followings.length <= 0) {
      return (
        <ErrorMessage
          icon="People"
          message="No Following"
          description="You have not following any people."
        />
      );
    } else if (followings.length <= 0) {
      return (
        <ErrorMessage
          icon="Play"
          message="No Following"
          description="This user not following any people."
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {followings.length <= 0 ? (
        <Error />
      ) : (
        <ul
          role="list"
          className="-mt-8 divide-y divide-gray-200 dark:divide-secondary"
        >
          {followings.map((following) => (
            <li className="py-4" key={following.following.id}>
              <div className="flex gap-2">
                <UserImage image={following.following.image!} />
                <div className="flex w-full flex-row justify-between">
                  <div className="flex flex-col text-sm">
                    <p className="font-semibold text-primary">
                      {following.following.name}
                    </p>
                    <p className="text-primary/80">
                      {following.following.handle}
                    </p>
                  </div>
                  <FollowButton
                    followingId={following.following.id}
                    viewer={{
                      hasFollowed: following.viewerHasFollowed,
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default ChannelFollowingsPage;
