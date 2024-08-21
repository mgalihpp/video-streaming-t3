"use client";

import { api } from "@/trpc/react";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { UserPlus } from "../Icons/Icons";
import Link from "next/link";

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
      {followingId === sessionData?.user.id ? (
        <Link
          className={buttonVariants({
            variant: "outline",
          })}
          href="/dashboard"
        >
          Dashboard
        </Link>
      ) : (
        <Button
          variant={userChoice.following ? "outline" : "default"}
          size="default"
          onClick={
            sessionData?.user.id
              ? () =>
                  handleFollow({
                    followingId: followingId,
                  })
              : () => void signIn()
          }
          className="flex items-center justify-center gap-2"
        >
          <UserPlus
            className={cn("h-5 w-5 stroke-secondary", {
              hidden: hideIcon,
              "stroke-primary": userChoice.following,
            })}
          />
          {userChoice.following ? "Following" : "Follow"}
        </Button>
      )}
    </>
  );
}
