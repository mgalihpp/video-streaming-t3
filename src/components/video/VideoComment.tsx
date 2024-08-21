"use client";

import { SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserImage } from "./VideoUserImage";
import { useSession } from "next-auth/react";
import moment from "moment";
import { memo, useState } from "react";
import { LikeDislikeCommentButton } from "@/components/button/LikeDislikeCommentButton";
import { type Comment } from "@prisma/client";
import { VideoCommentForm } from "./VideoCommentForm";

interface ReplyProps extends Comment {
  likes: number;
  dislikes: number;
  user: {
    id: string | null;
    name: string | null;
    image: string | null;
    handle: string | null;
  };
  replies: ReplyProps[];
}

interface CommentProps {
  comment: Comment & {
    replies: ReplyProps[];
    likes: number;
    dislikes: number;
  };
  user: {
    id: string | null;
    name: string | null;
    image: string | null;
    handle: string | null;
  };
}

interface VideoCommentProps {
  videoId: string;
  comments: CommentProps[];
  refetch: () => Promise<unknown>;
}

export function VideoComment({
  videoId,
  comments,
  refetch,
}: VideoCommentProps) {
  const { data: session } = useSession();

  return (
    <div className="py-5">
      <div className="flex flex-col space-y-4 rounded-2xl border border-gray-200 p-6 shadow-sm dark:border-secondary">
        <div className="mb-4 flex min-w-0 items-center gap-4">
          <p className="block text-sm font-medium leading-6 text-primary">
            {comments.length +
              comments.map((comment) => comment.comment.replies).flat()
                .length}{" "}
            <span>Comments</span>
          </p>

          <Button variant="ghost" className="gap-2">
            <SortDesc className="size-5" />
            <p>Sort</p>
          </Button>
        </div>

        <div className="flex w-full gap-2">
          <UserImage image={session?.user.image ?? ""} className="mt-2" />
          <div className="flex w-full flex-col">
            <VideoCommentForm videoId={videoId} refetch={refetch} />
          </div>
        </div>

        {comments
          .sort(
            (a, b) =>
              new Date(b.comment.createdAt).getTime() -
              new Date(a.comment.createdAt).getTime(),
          )
          .map(({ user, comment }) => {
            if (comment.parentId) return null;

            return (
              <div key={comment.id} className="space-y-4">
                <BlockComment
                  comment={comment}
                  user={user}
                  videoId={videoId}
                  refetch={refetch}
                />

                {comment.replies.map((reply) => {
                  return (
                    <div key={reply.id} className="ml-10">
                      <BlockComment
                        comment={{
                          ...reply,
                          likes: reply.likes,
                          dislikes: reply.dislikes,
                          replies: [],
                        }}
                        user={reply.user}
                        videoId={videoId}
                        refetch={refetch}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
}

const BlockComment = memo(
  ({
    comment,
    user,
    videoId,
    refetch,
  }: CommentProps & { videoId: string; refetch: () => Promise<unknown> }) => {
    return (
      <div key={comment.id}>
        <div className="flex gap-2">
          <UserImage image={user.image ?? ""} />
          <div className="flex w-full flex-col text-sm">
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-2">
                <p className="w-max font-semibold leading-6 text-primary">
                  {user.name}
                </p>
                <p className="text-xs text-primary/80">
                  {moment(comment.createdAt).fromNow()}
                </p>
              </div>
              <p className="text-primary/80">{user.handle}</p>
            </div>
            <CommentMessage message={comment.message ?? ""} />
            <LikeDislikeCommentButton
              id={comment.id}
              videoId={videoId}
              refetch={refetch}
              EngagementData={{
                id: comment.id,
                likes: comment.likes,
                dislikes: comment.dislikes,
              }}
              viewer={{
                hasDisliked: false,
                hasLiked: false,
              }}
            />
          </div>
        </div>
      </div>
    );
  },
);

const CommentMessage = ({ message }: { message: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to toggle between showing more or less
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Truncate the message if it's too long
  const truncatedMessage = message.slice(0, 150);

  return (
    <p className="my-2 block whitespace-pre-wrap text-primary/90">
      <span
        className="block"
        dangerouslySetInnerHTML={{
          __html: isExpanded ? message : truncatedMessage,
        }}
      />
      {/* Show "Show More" link if the message is longer than 150 characters */}
      {message.length > 150 && (
        <span
          onClick={toggleExpanded}
          className="ml-1 cursor-pointer text-primary/70 hover:underline"
        >
          {isExpanded ? "Show Less" : "Show More"}
        </span>
      )}
    </p>
  );
};

BlockComment.displayName = "BlockComment";
