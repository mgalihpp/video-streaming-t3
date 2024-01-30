import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { EngagementType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  addFollow: protectedProcedure
    .input(z.object({ followingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingFollow = await ctx.db.followEngagement.findMany({
        where: {
          followingId: input.followingId,
          followerId: ctx.session.user.id,
          engagementType: EngagementType.FOLLOW,
        },
      });

      if (existingFollow.length > 0) {
        const deleteFollow = await ctx.db.followEngagement.deleteMany({
          where: {
            followingId: input.followingId,
            followerId: ctx.session.user.id,
            engagementType: EngagementType.FOLLOW,
          },
        });
        return deleteFollow;
      } else {
        const follow = await ctx.db.followEngagement.create({
          data: {
            followingId: input.followingId,
            followerId: ctx.session.user.id,
            engagementType: EngagementType.FOLLOW,
          },
        });
        return follow;
      }
    }),

  getChannelById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        viewerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.id } });

      if (!user) {
        throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });
      }

      const followers = await ctx.db.followEngagement.count({
        where: {
          followingId: user.id,
        },
      });

      const followings = await ctx.db.followEngagement.count({
        where: {
          followerId: user.id,
        },
      });

      let viewerHasFollowed = false;
      const userWithEngagement = { ...user, followers, followings };

      if (input.viewerId && input.viewerId !== "") {
        viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
          where: {
            followingId: user.id,
            followerId: input.viewerId,
          },
        }));
      }
      const viewer = {
        hasFollowed: viewerHasFollowed,
      };

      return { user: userWithEngagement, viewer };
    }),
  getUsersFollowing: publicProcedure
    .input(z.object({ id: z.string(), viewerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
        include: {
          followings: {
            include: {
              following: {
                include: {
                  followings: true,
                },
              },
            },
          },
        },
      });

      if (!user)
        throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });

      const followings = user.followings;

      const followingWithViewerFollowedStatus = await Promise.all(
        followings.map(async (following) => {
          let viewerHasFollowed = false;
          if (input.viewerId && input.viewerId !== "") {
            viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
              where: {
                followingId: following.following.id,
                followerId: input.viewerId,
              },
            }));
          }
          return { ...following, viewerHasFollowed };
        }),
      );

      return {
        user,
        followings: followingWithViewerFollowedStatus,
      };
    }),
  getUsersFollowingProtected: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          followings: {
            include: {
              following: {
                include: {
                  followings: true,
                },
              },
            },
          },
        },
      });

      if (!user)
        throw new TRPCError({ message: "User not found", code: "NOT_FOUND" });

      const followings = user.followings;

      const followingWithViewerFollowedStatus = await Promise.all(
        followings.map(async (following) => {
          let viewerHasFollowed = false;
          if (input && input !== "") {
            viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
              where: {
                followingId: following.following.id,
                followerId: input,
              },
            }));
          }
          return { ...following, viewerHasFollowed };
        }),
      );

      return {
        followings: followingWithViewerFollowedStatus,
      };
    }),
  getDashboardData: protectedProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          videos: true,
        },
      });
      if (!user) {
        throw new TRPCError({
          message: "User not found",
          code: "NOT_FOUND",
        });
      }
      const videosWithCounts = await Promise.all(
        user.videos.map(async (video) => {
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

          const comments = await ctx.db.comment.count({
            where: {
              videoId: video.id,
            },
          });

          return {
            ...video,
            likes,
            dislikes,
            views,
            comments,
          };
        }),
      );

      const totalLikes = videosWithCounts.reduce(
        (total, video) => total + video.likes,
        0,
      );
      const totalViews = videosWithCounts.reduce(
        (total, video) => total + video.views,
        0,
      );
      const totalFollowers = await ctx.db.followEngagement.count({
        where: {
          followingId: ctx.session.user.id,
        },
      });
      return {
        user,
        totalLikes,
        totalViews,
        totalFollowers,
      };
    }),
  getInfiniteVideo: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        // cursor is a reference to the last item in the previous batch
        // it's used to fetch the next batch
        cursor: z.string().nullish(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, skip } = input;

      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          videos: {
            take: limit + 1,
            skip: skip,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              id: "desc",
            },
          },
        },
      });
      if (!user) {
        throw new TRPCError({
          message: "User not found",
          code: "NOT_FOUND",
        });
      }

      let nextCursor: typeof cursor | undefined = undefined;
      if (user.videos.length > limit) {
        const nextItem = user.videos.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const videosWithCounts = await Promise.all(
        user.videos.map(async (video) => {
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

          const comments = await ctx.db.comment.count({
            where: {
              videoId: video.id,
            },
          });

          return {
            ...video,
            likes,
            dislikes,
            views,
            comments,
          };
        }),
      );

      const totalLikes = videosWithCounts.reduce(
        (total, video) => total + video.likes,
        0,
      );
      const totalViews = videosWithCounts.reduce(
        (total, video) => total + video.views,
        0,
      );
      const totalFollowers = await ctx.db.followEngagement.count({
        where: {
          followingId: ctx.session.user.id,
        },
      });
      return {
        user,
        videos: videosWithCounts,
        totalLikes,
        totalViews,
        totalFollowers,
        nextCursor,
      };
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        // email: z.string().optional(),
        image: z.string().optional(),
        backgroundImage: z.string().optional(),
        handle: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      if (!user) {
        throw new TRPCError({ message: "User not valid", code: "BAD_REQUEST" });
      }

      const updateUser = await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name ?? user.name,
          // email: input.email ?? user.email,
          image: input.image ?? user.image,
          backgroundImage: input.backgroundImage ?? user.backgroundImage,
          handle: input.handle ?? user.handle,
          description: input.description ?? user.description,
        },
      });
      return updateUser;
    }),
});
