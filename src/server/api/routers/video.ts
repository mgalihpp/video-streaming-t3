import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { EngagementType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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
          followerId: video.userId,
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
});
