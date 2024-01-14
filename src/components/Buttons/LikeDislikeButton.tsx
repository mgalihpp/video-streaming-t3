"use client";

import { useEngagementButton } from "@/hooks/useEngagement";
import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import { signIn, useSession } from "next-auth/react";
import { ThumbsDown, ThumbsUp } from "../Icons/Icons";
import { cn } from "@/lib/utils";

interface LikeDislikeButtonProps {
  EngagementData: {
    id: string;
    likes: number;
    dislikes: number;
  };
  viewer: {
    hasLiked: boolean;
    hasDisliked: boolean;
  };
}

export default function LikeDislikeButton({
  EngagementData,
  viewer,
}: LikeDislikeButtonProps) {
  const { data: sessionData } = useSession();

  const { likeCount, dislikeCount, handleDislike, handleLike, userChoice } =
    useEngagementButton({
      EngagementData,
      viewer,
      addLikeMutation: api.videoEngagement.addLikeCount.useMutation(),
      addDislikeMutation: api.videoEngagement.addDislikeCount.useMutation(),
    });

  return (
    <div className="flex-end isolate inline-flex rounded-md shadow-sm">
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          sessionData?.user.id
            ? void handleLike({
                id: EngagementData.id,
              })
            : void signIn()
        }
        className="flex items-center justify-center gap-2"
      >
        <ThumbsUp
          className={cn(`w-5 h-5 shrink-0 stroke-gray-500`, {
            "fill-primary stroke-white": userChoice.like,
          })}
        />
        <span
          className={cn("text-gray-500", {
            "text-primary": userChoice.like,
          })}
        >
          {likeCount}
        </span>
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          sessionData?.user.id
            ? void handleDislike({
                id: EngagementData.id,
              })
            : void signIn()
        }
        className="flex items-center justify-center gap-2"
      >
        <ThumbsDown
          className={cn(`w-5 h-5 shrink-0 stroke-gray-500`, {
            "fill-destructive stroke-white": userChoice.dislike,
          })}
        />
        <span
          className={cn("text-gray-500", {
            "text-destructive": userChoice.dislike,
          })}
        >
          {dislikeCount}
        </span>
      </Button>
    </div>
  );
}
