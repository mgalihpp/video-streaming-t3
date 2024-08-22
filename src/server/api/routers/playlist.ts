import {
  addVideoToPlaylistInputSchema,
  createNewPlaylistInputSchema,
  getPlaylistsByIdInputSchema,
  getPlaylistsByTitleInputSchema,
  getPlaylistsByUserIdInputSchema,
} from "@/lib/schema/playlist";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  addVideoToPlaylist,
  deleteVideoFromPlaylist,
  getPlaylistById,
  getRawPlaylistFromTitle,
  getVideoExitsInPlaylist,
} from "@/services/playlistService";

export const playlistRouter = createTRPCRouter({
  addPlaylist: protectedProcedure
    .input(createNewPlaylistInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.playlist.create({
        data: {
          title: input.title,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
    }),
  addVideoToPlaylist: protectedProcedure
    .input(addVideoToPlaylistInputSchema)
    .mutation(async ({ ctx, input }) => {
      const videoExistsInPlaylist = await getVideoExitsInPlaylist(
        ctx,
        input.playlistId,
        input.videoId,
      );

      if (videoExistsInPlaylist.length > 0) {
        await deleteVideoFromPlaylist(ctx, input.playlistId, input.videoId);
      } else {
        return await addVideoToPlaylist(ctx, input.playlistId, input.videoId);
      }
    }),
  getPlaylists: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.playlist.findMany({
      where: {
        userId: ctx.session.user.id,
        NOT: [
          {
            title: "Liked Videos",
          },
          {
            title: "History",
          },
        ],
      },
      include: {
        PlaylistHasVideo: {
          include: {
            video: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }),
  getPlaylistsByTitle: protectedProcedure
    .input(getPlaylistsByTitleInputSchema)
    .query(async ({ ctx, input }) => {
      return await getRawPlaylistFromTitle(ctx, input);
    }),

  getPlaylistByUserId: publicProcedure
    .input(getPlaylistsByUserIdInputSchema)
    .query(async ({ ctx, input }) => {
      const rawPlaylist = await ctx.db.playlist.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          user: true,
          PlaylistHasVideo: {
            include: {
              video: true,
            },
          },
        },
      });

      return rawPlaylist;
    }),
  getPlaylistById: publicProcedure
    .input(getPlaylistsByIdInputSchema)
    .query(async ({ ctx, input }) => {
      return await getPlaylistById(ctx, input);
    }),
});
