"use client";

import { api } from "@/trpc/react";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { UserPlus } from "../Icons/Icons";

interface FollowButton {
  followingId: string;
  hideIcon?: boolean;
  viewer: {
    hasFollowed: boolean;
  };
}

export default function FollowButton({
  followingId,
  hideIcon,
  viewer,
}: FollowButton) {
  const { data: sessionData } = useSession();
  const [userChoice, setUserChoice] = useState({
    following: viewer.hasFollowed,
  });

  const addFollowMutation = api.user.addFollow.useMutation();
  const handleFollow = (input: { followingId: string }) => {
    if (userChoice.following) {
      setUserChoice({ following: false });
    } else {
      setUserChoice({ following: true });
    }
    addFollowMutation.mutate(input);
  };

  return (
    <>
      <Button
        variant={userChoice.following ? "outline" : "default"}
        size="lg"
        onClick={
          sessionData?.user.id
            ? () =>
                handleFollow({
                  followingId: followingId,
                })
            : () => void signIn()
        }
        className="flex gap-2 items-center justify-center"
      >
        <UserPlus
          className={cn("stroke-white w-5 h-5", {
            hidden: hideIcon,
            "stroke-primary": userChoice.following,
          })}
        />
        {userChoice.following ? "Following" : "Follow"}
      </Button>
    </>
  );
}
