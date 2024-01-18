import { api } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import { ErrorMessage, FollowButton, UserImage } from "@/components";

const ChannelFollowingsPage = async ({ params }: {params: {userId: string}}) => {
  const session = await getServerAuthSession();

  const { user, followings } = await api.user.getUsersFollowing.query({
    id: params.userId,
    viewerId: session?.user.id ?? "",
  });

  const Error = () => {
    if (params.userId === session?.user.id && followings.length < 0) {
      return (
        <ErrorMessage
          icon="People"
          message="No Following"
          description="You have not following any people."
        />
      );
    } else if (followings.length < 0) {
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
      {followings.length < 0 ? (
        <Error />
      ) : (
        <ul role="list" className="-mt-8 divide-y divide-gray-200">
          {followings.map((following) => (
            <li className="py-4" key={following.following.id}>
              <div className="flex gap-2">
                <UserImage image={following.following.image!} />
                <div className="flex w-full flex-row justify-between">
                  <div className="flex flex-col text-sm">
                    <p className="text-gra-600 font-semibold">
                      {following.following.name}
                    </p>
                    <p className="text-gray-600">
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
