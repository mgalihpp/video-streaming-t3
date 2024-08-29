"use client";

import { useEngagementButton } from "@/hooks/useEngagement";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { ThumbsDown, ThumbsUp } from "@/components/Icons/Icons";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Player, PlayerEvent } from "@lottiefiles/react-lottie-player";
import { useEffect, useRef, useState } from "react";

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

  const likeRef = useRef<Player>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  const router = useRouter();

  const { likeCount, dislikeCount, handleDislike, handleLike, userChoice } =
    useEngagementButton({
      EngagementData,
      viewer,
      addLikeMutation: api.videoEngagement.addLikeCount.useMutation(),
      addDislikeMutation: api.videoEngagement.addDislikeCount.useMutation(),
    });

  useEffect(() => {
    if (userChoice.like) {
      setAnimationComplete(true);
    }
  }, [userChoice.like]);

  return (
    <div className="flex-end isolate flex items-center rounded-full border shadow-sm">
      <Button
        type="button"
        variant="transparent"
        onClick={() => {
          if (sessionData?.user.id) {
            if (animationComplete) {
              setAnimationComplete(false);
              handleLike({
                id: EngagementData.id,
              });
            }

            likeRef.current?.play();
          } else {
            router.push("/login");
          }
        }}
        className="flex items-center justify-center gap-2 rounded-s-full border-none hover:bg-accent"
      >
        {animationComplete ? (
          <ThumbsUp
            className={cn(`h-5 w-5 shrink-0 stroke-primary`, {
              "fill-primary stroke-secondary": userChoice.like,
            })}
          />
        ) : (
          <Player
            onEvent={async (e) => {
              if (e === PlayerEvent.Complete) {
                setAnimationComplete(true);

                handleLike({
                  id: EngagementData.id,
                });
              }
            }}
            ref={likeRef}
            rendererSettings={{
              className: "lottie-svg-class",
            }}
            src="https://lottie.host/8d1ddbe3-be23-4489-b597-8a4953ab0204/IaBmFfJoxz.json"
          />
        )}
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
