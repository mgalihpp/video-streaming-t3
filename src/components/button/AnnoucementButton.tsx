"use client";

import { useEngagementButton } from "@/hooks/useEngagement";
import { api } from "@/trpc/react";
import { signIn, useSession } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  DotsVertical,
  Trash,
} from "@/components/Icons/Icons";
import { cn } from "@/lib/utils";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";

interface AnnoucementButtonProps {
  channel: {
    userId: string;
  };
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

export default function AnnoucementButton({
  channel,
  EngagementData,
  viewer,
}: AnnoucementButtonProps) {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const { likeCount, dislikeCount, handleDislike, handleLike, userChoice } =
    useEngagementButton({
      EngagementData,
      viewer,
      addLikeMutation: api.annoucement.addLikeAnnoucement.useMutation(),
      addDislikeMutation: api.annoucement.addDislikeAnnoucement.useMutation(),
    });

  const deleteAnnoucementMutation =
    api.annoucement.deleteAnnoucement.useMutation();

  const handleDeleteAnnoucement = (input: string) => {
    deleteAnnoucementMutation.mutate(input, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  return (
    <div className="flex-end isolate flex items-center rounded-full shadow-sm">
      <Button
        type="button"
        variant="transparent"
        onClick={() =>
          sessionData?.user.id
            ? void handleLike({
                id: EngagementData.id,
              })
            : void signIn()
        }
        className="flex items-center justify-center gap-2 rounded-s-full border-none hover:bg-accent"
      >
        <ThumbsUp
          className={cn(`size-4 shrink-0 stroke-primary`, {
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
      <Button
        type="button"
        variant="transparent"
        onClick={() =>
          sessionData?.user.id
            ? void handleDislike({
                id: EngagementData.id,
              })
            : void signIn()
        }
        className="flex items-center justify-center gap-2 rounded-e-full border-none hover:bg-accent"
      >
        <ThumbsDown
          className={cn(`size-4 shrink-0 stroke-primary`, {
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
      {sessionData?.user.id === channel.userId && (
        <Menu as="div" className='relative'>
          <div>
            <MenuButton className={buttonVariants({ variant: "ghost" })}>
              <DotsVertical className="size-4 stroke-primary" />
            </MenuButton>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 z-10 mt-2 w-fit origin-top-right rounded-md bg-background py-1 shadow-lg ring-1 ring-secondary ring-opacity-5 focus:outline-none">
              <MenuItem>
                <Button
                  className="flex gap-2"
                  variant="ghost"
                  onClick={() => handleDeleteAnnoucement(EngagementData.id)}
                >
                  <Trash className="h-4 w-4 stroke-destructive" />
                  Delete
                </Button>
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      )}
    </div>
  );
}
