import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import { Plus } from "@/components/Icons/Icons";
import { buttonVariants } from "@/components/ui/button";
import moment from "moment";
import { UserImage } from "@/components/video/VideoUserImage";
import AnnoucementButton from "@/components/button/AnnoucementButton";
import { AnnoucementForm } from "../../_components/AnnoucementForm";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ChannelAnnoucementsPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const session = await getServerAuthSession();

  const { annoucements, user } = await api.annoucement.getAnnoucementByUserId({
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
    <div
      className={cn("w-full", {
        "max-w-2xl": annoucements.length > 0,
      })}
    >
      {params.userId === session?.user.id ? <AnnoucementForm /> : null}
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
                  <Card>
                    <CardContent className="p-4">
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
                          <p className="self-end text-xs text-primary/70">
                            {moment(annoucement.createdAt).fromNow()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

export default ChannelAnnoucementsPage;
