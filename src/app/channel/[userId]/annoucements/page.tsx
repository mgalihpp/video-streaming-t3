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

const ChannelAnnoucementsPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
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
          <Link href="#" className={buttonVariants()}>
            <Plus className="mr-2 h-5 w-5 shrink-0 stroke-secondary" />
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
        <ul
          role="liest"
          className="-pt-8 divide-y divide-gray-200 dark:divide-secondary"
        >
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
                      <div className="flex items-start justify-between text-xs sm:items-center sm:gap-2">
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold leading-6 text-primary">
                            {author.name}
                          </p>
                          <p className="text-sm text-primary/80">
                            {author.handle}
                          </p>
                        </div>
                        <AnnoucementButton
                          channel={{
                            userId: params.userId,
                          }}
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
                      <p className="my-2 break-all text-sm text-primary/90">
                        {annoucement.message}
                      </p>
                      <p className="self-end text-sm text-primary/70">
                        {moment(annoucement.createdAt).fromNow()}
                      </p>
                    </div>
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
