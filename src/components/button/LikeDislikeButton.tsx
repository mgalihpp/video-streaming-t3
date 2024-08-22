"use client";

import { useEngagementButton } from "@/hooks/useEngagement";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { ThumbsDown, ThumbsUp } from "@/components/Icons/Icons";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const { likeCount, dislikeCount, handleDislike, handleLike, userChoice } =
    useEngagementButton({
      EngagementData,
      viewer,
      addLikeMutation: api.videoEngagement.addLikeCount.useMutation(),
      addDislikeMutation: api.videoEngagement.addDislikeCount.useMutation(),
    });

  return (
    <div className="flex-end isolate flex items-center rounded-full border shadow-sm">
      <Button
        type="button"
        variant="transparent"
        onClick={() =>
          sessionData?.user.id
            ? void handleLike({
                id: EngagementData.id,
              })
            : router.push("/login")
        }
        className="flex items-center justify-center gap-2 rounded-s-full border-none hover:bg-accent"
      >
        <ThumbsUp
          className={cn(`h-5 w-5 shrink-0 stroke-primary`, {
            "fill-primary stroke-secondary": userChoice.like,
          })}
        />
        <span
          className={cn("stroke-secondary", {
            "text-primary": userChoice.like,
          })}
        >
          {likeCount}
        </span>
      </Button>
      <Separator orientation="vertical" className="h-10" />
      <Button
        type="button"
        variant="transparent"
        onClick={() =>
          sessionData?.user.id
            ? void handleDislike({
                id: EngagementData.id,
              })
            : router.push("/login")
        }
        className="flex items-center justify-center gap-2 rounded-e-full border-none hover:bg-accent"
      >
        <ThumbsDown
          className={cn(`h-5 w-5 shrink-0 stroke-primary`, {
            "fill-destructive stroke-secondary": userChoice.dislike,
          })}
        />
        <span
          className={cn("stroke-secondary", {
            "text-destructive": userChoice.dislike,
          })}
        >
          {dislikeCount}
        </span>
      </Button>
    </div>
  );
}
