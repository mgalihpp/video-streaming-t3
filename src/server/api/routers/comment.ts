import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
});
