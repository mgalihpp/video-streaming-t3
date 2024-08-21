"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "@/components/Icons/Icons";
import { cn } from "@/lib/utils";
import { useEngagementButton } from "@/hooks/useEngagement";
import { api } from "@/trpc/react";
import { useState } from "react";
import { VideoCommentForm } from "@/components/video/VideoCommentForm";

interface LikeDislikeCommentButtonProps {
  id: string;
  videoId: string;
  viewer: {
    hasLiked: boolean;
    hasDisliked: boolean;
  };
  EngagementData: {
    id: string;
    likes: number;
    dislikes: number;
  };
  refetch: () => Promise<unknown>;
}

export const LikeDislikeCommentButton = ({
  id,
  videoId,
  viewer,
  EngagementData,
  refetch,
}: LikeDislikeCommentButtonProps) => {
  const { data: session } = useSession();

  const [isReplying, setIsReplying] = useState(false);

  const { likeCount, dislikeCount, handleDislike, handleLike, userChoice } =
    useEngagementButton({
      EngagementData,
      viewer,
      addLikeMutation: api.comment.addLikeCount.useMutation(),
      addDislikeMutation: api.comment.addDislikeCount.useMutation(),
    });

  return (
    <>
      <div className="flex-end isolate flex items-center gap-2">
        <Button
          type="button"
          aria-label="Like Button"
          variant="transparent"
          className="group min-w-0 gap-0.5 px-0"
          onClick={() =>
            session?.user.id
              ? void handleLike({
                  id,
                })
              : void signIn()
          }
        >
          <div className="flex items-center rounded-full p-2 group-hover:bg-accent">
            <ThumbsUp
              className={cn(`size-4 shrink-0 stroke-primary`, {
                "fill-primary stroke-secondary": userChoice.like,
              })}
            />
          </div>
          <span
            className={cn("stroke-secondary text-xs", {
              "text-primary": userChoice.like,
            })}
          >
            {likeCount}
          </span>
        </Button>
        <Button
          type="button"
          aria-label="Dislike Button"
          variant="transparent"
          className="group min-w-0 gap-0.5 px-0"
          onClick={() =>
            session?.user.id
              ? void handleDislike({
                  id,
                })
              : void signIn()
          }
        >
          <div className="flex items-center rounded-full p-2 group-hover:bg-accent">
            <ThumbsDown
              className={cn(`size-4 shrink-0 stroke-primary`, {
                "fill-primary stroke-secondary": userChoice.dislike,
              })}
            />
          </div>
          <span
            className={cn("stroke-secondary text-xs", {
              "text-primary": userChoice.dislike,
            })}
          >
            {dislikeCount}
          </span>
        </Button>
        <Button
          type="button"
          aria-label="Reply Button"
          className="group"
          variant="transparent"
          onClick={() => setIsReplying(!isReplying)}
        >
          <div className="rounded-full p-2 group-hover:bg-accent">
            <span className="text-xs text-primary">Reply</span>
          </div>
        </Button>
      </div>

      {isReplying && (
        <div className="flex w-full flex-col mt-2">
          <VideoCommentForm
            videoId={videoId}
            refetch={refetch}
            reply
            parentId={id}
            cb={(state) => setIsReplying(state)}
          />
        </div>
      )}
    </>
  );
};
