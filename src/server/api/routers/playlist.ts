import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { EngagementType } from "@prisma/client";

export const playlistRouter = createTRPCRouter({
  getSavePlaylistData: protectedProcedure.query(async ({ ctx }) => {
    const playlists = await ctx.db.playlist.findMany({
      where: {
        userId: ctx.session.user.id,
        NOT: [{ title: "Liked Videos" }, { title: "History" }],
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

    return playlists;
  }),
  addPlaylist: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(5).max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newPlaylist = await ctx.db.playlist.create({
        data: {
          title: input.title,
          description: input.description ?? "",
          userId: ctx.session.user.id,
        },
      });
      return newPlaylist;
    }),

  getPlaylistByUserId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const rawPlaylist = await ctx.db.playlist.findMany({
        where: {
          userId: input,
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

      const playlists = await Promise.all(
        rawPlaylist.map(async (playlist) => {
          const videoCount = await ctx.db.playlistHasVideo.count({
            where: {
              playlistId: playlist.id,
            },
          });
          const firstVideoInPlaylist = await ctx.db.playlistHasVideo.findFirst({
            where: {
              playlistId: playlist.id,
            },
            include: {
              video: {
                select: {
                  thumbnailUrl: true,
                },
              },
            },
          });

          return {
            ...playlist,
            videoCount,
            playlistThumbnail: firstVideoInPlaylist?.video?.thumbnailUrl,
          };
        }),
      );
      return { playlists };
    }),
  getPlaylistById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const rawPlaylist = await ctx.db.playlist.findUnique({
        where: {
          id: input,
        },
        include: {
          user: true,
          PlaylistHasVideo: {
            include: {
              video: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      if (!rawPlaylist)
        throw new TRPCError({
          message: "Playlist not found",
          code: "NOT_FOUND",
        });

      const followers = await ctx.db.followEngagement.count({
        where: {
          followingId: rawPlaylist.userId,
        },
      });

      const userWithFollowers = { ...rawPlaylist.user, followers };

      const videoWithUser = rawPlaylist.PlaylistHasVideo.map(({ video }) => ({
        ...video,
        author: video?.user,
      }));

      const videos = videoWithUser.map(({ author, ...video }) => video);
      const users = videoWithUser.map(({ user }) => user);
      const videoWithCount = await Promise.all(
        videos.map(async (video) => {
          const views = await ctx.db.videoEngagement.count({
            where: { videoId: video.id, engagementType: EngagementType.VIEW },
          });
          return {
            ...video,
            views,
          };
        }),
      );

      const { user, PlaylistHasVideo: rawVideo, ...playlistInfo } = rawPlaylist;

      return {
        user: userWithFollowers,
        videos: videoWithCount,
        authors: users,
        playlist: playlistInfo,
      };
    }),
  getPlaylistByTitle: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      let rawPlaylist = await ctx.db.playlist.findFirst({
        where: {
          title: input,
          userId: ctx.session.user.id,
        },
        include: {
          user: true,
          PlaylistHasVideo: {
            include: {
              video: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (rawPlaylist === null || rawPlaylist === undefined) {
        rawPlaylist = await ctx.db.playlist.create({
          data: {
            title: input,
            userId: ctx.session.user.id,
          },
          include: {
            user: true,
            PlaylistHasVideo: {
              include: {
                video: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });
      }

      const followers = await ctx.db.followEngagement.count({
        where: {
          followingId: rawPlaylist?.userId,
        },
      });

      const userWithFollowers = { ...rawPlaylist?.user, followers };

      const videoWithUser =
        rawPlaylist?.PlaylistHasVideo?.map(({ video }) => ({
          ...video,
          author: video?.user,
        })) ?? [];

      const videos = videoWithUser.map(({ author, ...video }) => video);
      const users = videoWithUser.map(({ user }) => user);
      const videoWithCount = await Promise.all(
        videos.map(async (video) => {
          const views = await ctx.db.videoEngagement.count({
            where: { videoId: video.id, engagementType: EngagementType.VIEW },
          });
          return {
            ...video,
            views,
          };
        }),
      );

      const {
        user,
        PlaylistHasVideo: rawVideo,
        ...playlistInfo
      } = rawPlaylist ?? { user: null, PlaylistHasVideo: [] };

      return {
        user: userWithFollowers,
        videos: videoWithCount,
        authors: users,
        playlist: playlistInfo,
      };
    }),
});
