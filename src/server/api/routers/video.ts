import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { EngagementType, type PrismaClient, type Prisma } from "@prisma/client";
import { type DefaultArgs } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

type Context = {
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
};

const checkVideoOwnerShip = async (
  ctx: Context,
  id: string,
  userId: string,
) => {
  const video = await ctx.db.video.findUnique({
    where: {
      id: id,
    },
  });

  if (!video ?? video?.userId !== userId)
    throw new TRPCError({
      message: "video not found",
      code: "INTERNAL_SERVER_ERROR",
    });
  return video;
};

export const videoRouter = createTRPCRouter({
  getRandomVideo: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const videoWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
        },
        include: {
          user: true,
        },
      });

      const videos = videoWithUser.map(({ user, ...video }) => video);
      const users = videoWithUser.map(({ user }) => user);

      const videoWithCount = await Promise.all(
        videos.map(async (video) => {
          const views = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.VIEW,
            },
          });
          return {
            ...video,
            views,
          };
        }),
      );

      const indices = Array.from(
        { length: videoWithCount.length },
        (_, i) => i,
      );

      //shuffle array
      for (let i = indices.length - 1; i > 0; i--) {
        if (indices[i] !== undefined) {
          const j = Math.floor(Math.random() * (i + 1));

          if (indices[j] !== undefined) {
            [indices[i], indices[j]] = [indices[j]!, indices[i]!];
          }
        }
      }
      const shuffleVideoWithCounts = indices.map((i) => videoWithCount[i]);
      const shuffleUsers = indices.map((i) => users[i]);

      const randomVideos = shuffleVideoWithCounts.slice(0, input);
      const randomUsers = shuffleUsers.slice(0, input);

      return { videos: randomVideos, users: randomUsers };
    }),

  getVideoBySearch: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const videoWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
          title: {
            contains: input,
          },
        },
        take: 10,
        include: {
          user: true,
        },
      });

      const videos = videoWithUser.map(({ user, ...video }) => video);
      const users = videoWithUser.map(({ user }) => user);

      const videoWithCount = await Promise.all(
        videos.map(async (video) => {
          const views = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.VIEW,
            },
          });
          return {
            ...video,
            views,
          };
        }),
      );
      return { videos: videoWithCount, users: users };
    }),

  getVideoById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        viewerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rawVideo = await ctx.db.video.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: true,
          Comment: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!rawVideo) {
        throw new TRPCError({ message: "Video not found", code: "NOT_FOUND" });
      }

      const { user, Comment, ...video } = rawVideo;

      const followers = await ctx.db.followEngagement.count({
        where: {
          followingId: video.userId,
        },
      });

      const likes = await ctx.db.videoEngagement.count({
        where: {
          videoId: video.id,
          engagementType: EngagementType.LIKE,
        },
      });

      const dislikes = await ctx.db.videoEngagement.count({
        where: {
          videoId: video.id,
          engagementType: EngagementType.DISLIKE,
        },
      });

      const views = await ctx.db.videoEngagement.count({
        where: {
          videoId: video.id,
          engagementType: EngagementType.VIEW,
        },
      });

      let viewerHasFollowed = false;
      let viewerHasLikes = false;
      let viewerHasDislikes = false;

      if (input.viewerId && input.viewerId !== "") {
        viewerHasLikes = !!(await ctx.db.videoEngagement.findFirst({
          where: {
            videoId: rawVideo.id,
            userId: input.viewerId,
            engagementType: EngagementType.LIKE,
          },
        }));
        viewerHasDislikes = !!(await ctx.db.videoEngagement.findFirst({
          where: {
            videoId: rawVideo.id,
            userId: input.viewerId,
            engagementType: EngagementType.DISLIKE,
          },
        }));
        viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
          where: {
            followingId: rawVideo.userId,
            followerId: input.viewerId,
          },
        }));
      } else {
        viewerHasDislikes = false;
        viewerHasLikes = false;
        viewerHasFollowed = false;
      }

      const viewer = {
        hasFollowed: viewerHasFollowed,
        hasLiked: viewerHasLikes,
        hasDisliked: viewerHasDislikes,
      };

      const userWithFollowers = { ...user, followers };
      const videoWithLikeDislikesViews = { ...video, likes, dislikes, views };
      const commentWithUsers = Comment.map(({ user, ...comment }) => ({
        user,
        comment,
      }));

      return {
        video: videoWithLikeDislikesViews,
        user: userWithFollowers,
        comments: commentWithUsers,
        viewer,
      };
    }),

  addVideoToPlaylist: protectedProcedure
    .input(z.object({ playlistId: z.string(), videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const videoExitsInPlaylist = await ctx.db.playlistHasVideo.findMany({
        where: {
          playlistId: input.playlistId,
          videoId: input.videoId,
        },
      });

      if (videoExitsInPlaylist.length > 0) {
        const deleteVideo = await ctx.db.playlistHasVideo.deleteMany({
          where: {
            playlistId: input.playlistId,
            videoId: input.videoId,
          },
        });
        return deleteVideo;
      } else {
        const newVideoToPlaylist = await ctx.db.playlistHasVideo.create({
          data: {
            playlistId: input.playlistId,
            videoId: input.videoId,
          },
        });
        return newVideoToPlaylist;
      }
    }),

  getVideoByUserId: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const videoWithUser = await ctx.db.video.findMany({
        where: {
          userId: input,
          publish: true,
        },
        include: {
          user: true,
        },
      });

      if (!videoWithUser)
        throw new TRPCError({
          message: "User video not found",
          code: "NOT_FOUND",
        });

      const videos = videoWithUser.map(({ user, ...video }) => video);
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

      return { videos: videoWithCount, users: users };
    }),
  publishVideo: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const video = await checkVideoOwnerShip(ctx, input, ctx.session.user.id);

      const publishVideo = await ctx.db.video.update({
        where: {
          id: video.id,
        },
        data: {
          publish: !video.publish,
        },
      });

      return publishVideo;
    }),
  deleteVideo: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const video = await checkVideoOwnerShip(ctx, input, ctx.session.user.id);

      const deleteVideo = await ctx.db.video.delete({
        where: {
          id: video.id,
        },
      });
      return deleteVideo;
    }),
  updateVideo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const video = await checkVideoOwnerShip(
        ctx,
        input.id,
        ctx.session.user.id,
      );

      const updateVideo = await ctx.db.video.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title ?? video.title,
          description: input.description ?? video.description,
          thumbnailUrl: input.thumbnailUrl ?? video.thumbnailUrl,
        },
      });

      return updateVideo;
    }),
  addNewVideo: protectedProcedure
    .input(
      z.object({
        videoUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newVideo = await ctx.db.video.create({
        data: {
          userId: ctx.session.user.id,
          title: "",
          description: "",
          thumbnailUrl: "",
          videoUrl: input.videoUrl,
          publish: false,
        },
      });
      return newVideo;
    }),
});
