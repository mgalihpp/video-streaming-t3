"use client";

import Image from "next/image";
import Link from "next/link";
import { Thumbnail } from ".";
import { cn } from "@/lib/utils";
import moment from "moment";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "./Icons/Icons";
import { signIn, useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";

interface VideoComponentProps {
  videos: {
    id: string;
    title: string;
    thumbnailUrl: string;
    createdAt: Date;
    views: number;
  }[];
  users: {
    name: string | null;
    image: string | null;
  }[];
  refetch?: () => Promise<unknown>;
}

interface CommentProps {
  comment: {
    id: string;
    message: string | null;
    createdAt: Date;
  };
  user: {
    id: string | null;
    name: string | null;
    image: string | null;
    handle: string | null;
  };
}

interface VideoCommentSectionProps {
  videoId: string;
  comments: CommentProps[];
  refetch: () => Promise<unknown>;
}

export const MultiColumnVideo: React.FC<VideoComponentProps> = ({
  videos,
  users,
}) => {
  return (
    <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-8 md:mx-0 md:max-w-none md:grid-cols-2 lg:mx-0 lg:grid-cols-3 xl:mx-0 xl:max-w-none 2xl:mx-0 2xl:max-w-none 2xl:grid-cols-3">
      {videos.map((video, index) => {
        const user = users[index];
        if (!user) {
          return null;
        }

        return (
          <Link
            key={video.id}
            href={`/watch?video=${video.id}`}
            className="flex flex-col items-start justify-between rounded-2xl bg-background/20 hover:bg-secondary/30"
          >
            <div className="relative w-full">
              <Thumbnail thumbnailUrl={video.thumbnailUrl} />
              <div className="max-w-xl">
                <div className="relative mt-4 flex gap-x-4">
                  <UserImage image={user.image!} />
                  <div className="w-full">
                    <VideoTitle title={video.title} limitHeight={true} />
                    <VideoUserName name={user.name!} />
                    <VideoInfo
                      views={video.views}
                      createdAt={video.createdAt}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export const SingleColumnVideo: React.FC<VideoComponentProps> = ({
  videos,
  users,
}) => (
  <div>
    {videos.map((video, index) => {
      const user = users[index];
      if (!user) {
        return null;
      }
      return (
        <Link href={`/watch?video=${video.id}`} key={video.id}>
          <div className="my-5 flex flex-col gap-4 bg-background/20 hover:bg-secondary/30 lg:flex-row">
            <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:w-64 lg:shrink-0">
              <Thumbnail thumbnailUrl={video.thumbnailUrl} />
            </div>
            <div>
              <VideoTitle title={video.title} />
              <VideoInfo views={video.views} createdAt={video.createdAt} />

              <div className="relative mt-2 flex flex-row items-center gap-x-4">
                <UserImage image={user.image!} />
                <VideoUserName name={user.name!} />
              </div>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
);

export const SmallSingleColumnVideo: React.FC<VideoComponentProps> = ({
  videos,
  users,
  refetch,
}) => {
  return (
    <>
      {videos.map((video, index) => {
        const user = users[index];
        if (!user) {
          return null;
        }
        return (
          <Link
            href={`/watch?video=${video.id}`}
            onClick={refetch}
            key={video.id}
          >
            <div className="relative isolate my-4 flex flex-col lg:gap-4 rounded-2xl border bg-background/20 hover:bg-secondary/30 lg:flex-row">
              <div className="aspect-[16/9] sm:aspect-[2/1] lg:w-52 lg:shrink-0">
                <Thumbnail thumbnailUrl={video.thumbnailUrl} />
              </div>
              <div className="flex w-full flex-col items-start overflow-hidden text-xs max-lg:mx-2 pb-2 lg:p-0">
                <VideoTitle title={video.title} limitHeight limitSize />
                <VideoInfo views={video.views} createdAt={video.createdAt} />
                <VideoUserName name={user.name!} />
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
};

export function VideoTitle({
  title,
  limitHeight,
  limitSize,
}: {
  title: string;
  limitHeight?: boolean;
  limitSize?: boolean;
}) {
  return (
    <h1
      className={cn(
        `max-w-md text-lg font-semibold leading-6 text-primary group-hover:text-gray-600`,
        {
          "text-base": limitSize,
          "max-h-12 w-full overflow-hidden": limitHeight,
        },
      )}
    >
      {title}
    </h1>
  );
}

export function VideoInfo({
  views,
  createdAt,
}: {
  views: number;
  createdAt: Date | string;
}) {
  return (
    <div className="mt-1 flex max-h-6 items-start overflow-hidden text-sm">
      <p className="text-primary/80">
        {views} <span>Views</span>
      </p>
      <li className="pl-2 text-sm text-primary/80">
        {moment(createdAt).fromNow()}
      </li>
    </div>
  );
}

export function VideoUserName({ name }: { name: string }) {
  return (
    <p className="max-h-5 overflow-hidden text-sm font-semibold leading-6 text-primary/80">
      {name}
    </p>
  );
}

export function UserImage({
  image,
  className = "",
}: {
  image: string;
  className?: string;
}) {
  return (
    <div
      className={`relative ${
        className ? className : "max-h-9 min-h-9 min-w-9 max-w-9"
      }`}
    >
      <Image
        src={image}
        alt="user image"
        className="absolute rounded-full"
        fill
      />
    </div>
  );
}

export function VideoDescription({
  text,
  length,
  border = false,
}: {
  text: string;
  length: number;
  border?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (text.length === 0 || text === null) {
    return null;
  } else if (text.length < length) {
    return (
      <>
        {border ? <div className="border-b border-gray-200 dark:border-secondary"></div> : null}
        <p className="my-3 text-left text-sm font-semibold text-primary/80">
          {text}
        </p>
      </>
    );
  } else {
    return (
      <>
        {border ? <div className="border-b border-gray-200 dark:border-secondary"></div> : null}
        <div className="relative w-full">
          <button
            onClick={toggleExpand}
            className="flex flex-row place-content-evenly"
          >
            <p
              className={`text-left text-sm font-semibold text-primary/90 break-words ${
                !isExpanded ? "line-clamp-2" : ""
              }`}
            >
              {text}
            </p>
            <span className="items-end">
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </span>
          </button>
        </div>
      </>
    );
  }
}

export function VideoCommentSection({
  videoId,
  comments,
  refetch,
}: VideoCommentSectionProps) {
  const { data: sessionData } = useSession();
  const [commentInput, setCommentInput] = useState("");
  const [disable, setDisable] = useState(false);
  const [errorInput, setErrorInput] = useState(false);
  const [errorInputMsg, setErrorInputMsg] = useState<
    string | string[] | undefined
  >("");

  const addCommentMutation = api.comment.addComment.useMutation();
  const addComment = (input: { videoId: string; message: string }) => {
    addCommentMutation.mutate(input, {
      onError: (err) => {
        if (err.data?.code === "BAD_REQUEST") {
          setErrorInput(true);
          setErrorInputMsg(err.data.zodError?.fieldErrors.message);
        }
        setDisable(false);
      },
      onSuccess: () => {
        void refetch();
        setErrorInput(false);
        setErrorInputMsg("");
        setCommentInput("");
        setDisable(false);
      },
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisable(true);
    addComment({
      videoId: videoId,
      message: commentInput,
    });
  };

  return (
    <>
      <div className="py-5">
        <div className="flex space-x-3 rounded-2xl border border-gray-200 dark:border-secondary p-6 shadow-sm">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="block text-sm font-medium leading-6 text-primary">
              {comments.length} <span>Comments</span>
            </p>

            <form onSubmit={handleCommentSubmit}>
              <div className="mt-2 flex flex-row gap-2">
                <div className="w-full">
                  <textarea
                    rows={1}
                    maxLength={200}
                    name="comment"
                    id="comment"
                    placeholder="Add comment"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="block w-full rounded-md border-0 p-4 py-1.5 text-primary dark:bg-secondary ring-1 ring-inset ring-gray-200"
                  />
                </div>
                <div className="flex-shrink-0">
                  <Button
                    aria-label="add comment"
                    disabled={disable}
                    onClick={() =>
                      sessionData?.user.id ? void {} : void signIn()
                    }
                  >
                    Comment
                  </Button>
                </div>
              </div>
              {errorInput && (
                <p className="text-sm text-destructive">{errorInputMsg}</p>
              )}
            </form>

            {comments
              .sort(
                (a, b) =>
                  new Date(b.comment.createdAt).getTime() -
                  new Date(a.comment.createdAt).getTime(),
              )
              .map(({ user, comment }) => (
                <div className="my-6" key={comment.id}>
                  <div className="my-4 border-t border-gray-200 dark:border-secondary" />
                  <div className="flex gap-2">
                    <UserImage image={user.image!} />
                    <div className="flex w-full flex-col text-sm">
                      <div className="flex flex-col">
                        <div className="flex flex-row gap-2">
                          <p className="w-max font-semibold leading-6 text-primary">
                            {user.name}
                          </p>
                          <p className="text-primary/80">
                            {moment(comment.createdAt).fromNow()}
                          </p>
                        </div>
                        <p className="text-primary/80">{user.handle}</p>
                      </div>
                      <p className="my-2 text-primary/90">{comment.message}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
