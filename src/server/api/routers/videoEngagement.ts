import {
  addDislikeCountInputSchema,
  addLikeCountInputSchema,
  addViewCountInputSchema,
} from "@/lib/schema/videoEngagement";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createEngagement,
  deleteEngagementIfExits,
  getExitsDislike,
  getExitsLike,
} from "@/services/engagementService";
import { getOrCreatePlaylist } from "@/services/playlistService";
import { EngagementType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const videoEngagementRouter = createTRPCRouter({
  addLikeCount: protectedProcedure
    .input(addLikeCountInputSchema)
    .mutation(async ({ ctx, input }) => {
      await deleteEngagementIfExits(
        ctx,
        input.id,
        ctx.session.user.id,
        EngagementType.DISLIKE,
      );

      const existingLike = await getExitsLike(
        ctx,
        ctx.session.user.id,
        input.id,
      );

      const playlist = await getOrCreatePlaylist(
        ctx,
        "Liked Videos",
        "Your Liked Videos",
        ctx.session.user.id,
      );

      if (existingLike.length > 0) {
        await ctx.db.playlistHasVideo.deleteMany({
          where: {
            playlistId: playlist.id,
            videoId: input.id,
          },
        });

        return await deleteEngagementIfExits(
          ctx,
          input.id,
          ctx.session.user.id,
          EngagementType.LIKE,
        );
      } else {
        await ctx.db.playlistHasVideo.create({
          data: {
            playlistId: playlist.id,
            videoId: input.id,
          },
        });

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
        input.id,
        ctx.session.user.id,
        EngagementType.LIKE,
      );
      const existingDislike = await getExitsDislike(
        ctx,
        ctx.session.user.id,
        input.id,
      );

      const playlist = await getOrCreatePlaylist(
        ctx,
        "Liked Videos",
        "Your Liked Videos",
        ctx.session.user.id,
      );

      await ctx.db.playlistHasVideo.deleteMany({
        where: {
          playlistId: playlist.id,
          videoId: input.id,
        },
      });

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
  addViewCount: protectedProcedure
    .input(addViewCountInputSchema)
    .mutation(async ({ ctx, input }) => {
      const rawVideo = await ctx.db.video.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!rawVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sorry this video does not exist",
        });
      }

      if (ctx.session?.user.id && ctx.session.user.id !== "") {
        const playlist = await getOrCreatePlaylist(
          ctx,
          "History",
          "Your history video",
          ctx.session.user.id,
        );

        const isVideoExitsInPlaylist = await ctx.db.playlistHasVideo.findFirst({
          where: {
            playlistId: playlist.id,
            videoId: input.id,
          },
        });

        if (!isVideoExitsInPlaylist) {
          await ctx.db.playlistHasVideo.create({
            data: {
              playlistId: playlist.id,
              videoId: input.id,
            },
          });
        }
      }

      return await createEngagement(
        ctx,
        input.id,
        ctx.session?.user.id ?? "",
        EngagementType.VIEW,
      );
    }),
});
