import { EngagementType } from "@prisma/client";
import { addCommentInputSchema } from "@/lib/schema/comment";
import {
  addDislikeCountInputSchema,
  addLikeCountInputSchema,
} from "@/lib/schema/videoEngagement";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  addNewComment,
  createEngagement,
  deleteEngagementIfExits,
  getComments,
  getExitsDislike,
  getExitsLike,
} from "@/services/commentService";

export const commentRouter = createTRPCRouter({
  addComment: protectedProcedure
    .input(addCommentInputSchema)
    .mutation(async ({ ctx, input }) => {
      await addNewComment(
        ctx,
        input.videoId,
        ctx.session.user.id,
        input.message,
        input.parentId!,
      );

      return await getComments(ctx, input.videoId);
    }),
  addLikeCount: protectedProcedure
    .input(addLikeCountInputSchema)
    .mutation(async ({ ctx, input }) => {
      await deleteEngagementIfExits(
        ctx,
        ctx.session.user.id,
        input.id,
        EngagementType.DISLIKE,
      );

      const existingLike = await getExitsLike(
        ctx,
        ctx.session.user.id,
        input.id,
      );

      if (existingLike.length > 0) {
        return await deleteEngagementIfExits(
          ctx,
          input.id,
          ctx.session.user.id,
          EngagementType.LIKE,
        );
      } else {
        return await createEngagement(
          ctx,
          input.id,
          ctx.session.user.id,
          EngagementType.LIKE,
        );
      }
    }),
  addDislikeCount: protectedProcedure
    .input(addDislikeCountInputSchema)
    .mutation(async ({ ctx, input }) => {
      await deleteEngagementIfExits(
        ctx,
        ctx.session.user.id,
        input.id,
        EngagementType.LIKE,
      );
      const existingDislike = await getExitsDislike(
        ctx,
        ctx.session.user.id,
        input.id,
      );

      if (existingDislike.length > 0) {
        return await deleteEngagementIfExits(
          ctx,
          input.id,
          ctx.session.user.id,
          EngagementType.DISLIKE,
        );
      } else {
        return await createEngagement(
          ctx,
          input.id,
          ctx.session.user.id,
          EngagementType.DISLIKE,
        );
      }
    }),
});
