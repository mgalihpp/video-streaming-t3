import { EngagementType, Prisma, type PrismaClient } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { DefaultArgs } from "@prisma/client/runtime/library";

type Context = {
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
};

async function getOrCreatePlaylist(
  ctx: Context,
  title: string,
  description: string,
  userId: string,
) {
  let playlist = await ctx.db.playlist.findFirst({
    where: { title, userId },
  });

  if (playlist === null || playlist === undefined) {
    playlist = await ctx.db.playlist.create({
      data: { title, description, userId },
    });
  }

  return playlist;
}

async function createEngagement(
  ctx: Context,
  id: string,
  userId: string,
  type: EngagementType,
) {
  return await ctx.db.videoEngagement.create({
    data: {
      videoId: id,
      userId,
      engagementType: type,
    },
  });
}

async function deleteEngagementIfExits(
  ctx: Context,
  id: string,
  userId: string,
  type: EngagementType,
) {
  const existingEngagement = await ctx.db.videoEngagement.findMany({
    where: { videoId: id, userId, engagementType: type },
  });

  if (existingEngagement.length > 0) {
    await ctx.db.videoEngagement.deleteMany({
      where: { videoId: id, userId, engagementType: type },
    });
  }
}

export const videoEngagementRouter = createTRPCRouter({
  addLikeCount: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteEngagementIfExits(
        ctx,
        input.id,
        ctx.session.user.id,
        EngagementType.DISLIKE,
      );

      const existingLike = await ctx.db.videoEngagement.findMany({
        where: {
          videoId: input.id,
          userId: ctx.session.user.id,
          engagementType: EngagementType.LIKE,
        },
      });

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
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteEngagementIfExits(
        ctx,
        input.id,
        ctx.session.user.id,
        EngagementType.LIKE,
      );

      const existingDislike = await ctx.db.videoEngagement.findMany({
        where: {
          videoId: input.id,
          userId: ctx.session.user.id,
          engagementType: EngagementType.DISLIKE,
        },
      });

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

  addViewCount: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session?.user.id && ctx.session.user.id !== "") {
        const playlist = await getOrCreatePlaylist(
          ctx,
          "History",
          "Your history video",
          ctx.session.user.id,
        );

        await ctx.db.playlistHasVideo.create({
          data: {
            playlistId: playlist.id,
            videoId: input.id,
          },
        });
      }

      return await createEngagement(
        ctx,
        input.id,
        ctx.session?.user.id ?? "",
        EngagementType.VIEW,
      );
    }),
});
