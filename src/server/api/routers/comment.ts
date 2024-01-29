import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const commentRouter = createTRPCRouter({
  addComment: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        message: z.string().max(200).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.comment.create({
        data: {
          videoId: input.videoId,
          userId: ctx.session.user.id,
          message: input.message,
        },
      });
      const getAllNewComments = await ctx.db.comment.findMany({
        where: {
          videoId: input.videoId,
        },
      });
      return getAllNewComments;
    }),
  addReplyComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.message !== "") {
        const comment = await ctx.db.comment.findFirst({
          where: {
            id: input.commentId,
          },
        });

        if (!comment)
          throw new TRPCError({
            message: "Comment not found",
            code: "NOT_FOUND",
          });

        const addReply = await ctx.db.repliesComment.create({
          data: {
            userId: ctx.session.user.id,
            message: input.message,
          },
        });

        const newReplyComment = await ctx.db.commentHasReplies.create({
          data: {
            commentId: comment.id,
            repliesCommentId: addReply.id,
          },
        });

        return newReplyComment;
      }
    }),
});
