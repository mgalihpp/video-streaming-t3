import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import {
  AddAnnoucementForm,
  AnnoucementButton,
  ErrorMessage,
  UserImage,
} from "@/components";
import Link from "next/link";
import { Plus } from "@/components/Icons/Icons";
import { buttonVariants } from "@/components/ui/button";
import moment from "moment";

const ChannelAnnoucementsPage = async ({ params }: {params: {userId: string}}) => {
  const session = await getServerAuthSession();

  const { annoucements, user } =
    await api.annoucement.getAnnoucementByUserId.query({
      id: params.userId,
      viewerId: session?.user.id ?? "",
    });

  const Error = () => {
    if (params.userId === session?.user.id && annoucements.length <= 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2">
          <ErrorMessage
            icon="Horn"
            message="No Annoucements Created"
            description="You have not yet created a annoucement."
          />
          <Link href="/profile/edit" className={buttonVariants()}>
            <Plus className="mr-2 h-5 w-5 shrink-0 stroke-white" />
            Create Annoucement
          </Link>
        </div>
      );
    } else if (annoucements.length <= 0) {
      return (
        <ErrorMessage
          icon="Horn"
          message="No Annoucements"
          description="This user has no annoucements."
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {params.userId === session?.user.id ? <AddAnnoucementForm /> : null}
      {annoucements.length <= 0 ? (
        <Error />
      ) : (
        <ul role="liest" className="-pt-8 divide-y divide-gray-200">
          {annoucements
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((annoucement, index) => {
              const author = user[index];
              if (!author) return null;

              return (
                <li className="pt-4" key={annoucement.id}>
                  <div className="flex gap-2">
                    <UserImage image={author.image!} />
                    <div className="flex w-full flex-col">
                      <div className="flex flex-col">
                        <div className="flex flex-row items-start gap-2 text-xs">
                          <p className="w-max text-sm font-semibold leading-6 text-gray-900">
                            {author.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {moment(annoucement.createdAt).fromNow()}
                          </p>
                        </div>

                        <p className="text-sm text-gray-600">{author.handle}</p>
                      </div>
                      <p className="my-2 text-sm text-gray-600">
                        {annoucement.message}
                      </p>
                    </div>
                    <AnnoucementButton
                      EngagementData={{
                        id: annoucement.id,
                        likes: annoucement.likes,
                        dislikes: annoucement.dislikes,
                      }}
                      viewer={{
                        hasLiked: annoucement.viewer.hasLiked,
                        hasDisliked: annoucement.viewer.hasDisliked,
                      }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </>
  );
};

export default ChannelAnnoucementsPage;
