import {
  addFollowInputSchema,
  getUserChannelInputSchema,
  updateUserInputSchema,
} from "@/lib/schema/user";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  createFollowEngagement,
  deleteFollowEngagementIfExits,
  getExitsFollowing,
} from "@/services/engagementService";
import { getUserChannel, updateUser } from "@/services/userService";
import { EngagementType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  addFollow: protectedProcedure
    .input(addFollowInputSchema)
    .mutation(async ({ ctx, input }) => {
      const existingFollow = await getExitsFollowing(
        ctx,
        input.followingId,
        ctx.session.user.id,
      );

      if (existingFollow.length > 0) {
        await deleteFollowEngagementIfExits(
          ctx,
          input.followingId,
          ctx.session.user.id,
        );
      } else {
        await createFollowEngagement(
          ctx,
          input.followingId,
          ctx.session.user.id,
        );
      }
    }),
  getUserStats: protectedProcedure.mutation(async ({ ctx }) => {
    const userVideos = await ctx.db.video.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    const videosWithCounts = await Promise.all(
      userVideos.map(async (video) => {
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
      userVideos: videosWithCounts,
      totalLikes,
      totalViews,
      totalFollowers,
    };
  }),
  updateUser: protectedProcedure
    .input(updateUserInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateUser(ctx, ctx.session.user.id, input);
    }),
  getUserChannel: protectedProcedure
    .input(getUserChannelInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await getUserChannel(ctx, input);
      } catch (error) {
        if (error instanceof TRPCError && error.code === "NOT_FOUND") {
          // Handle server side errors to not get crash the app
          return null;
        }
      }
    }),
  getUsersFollowing: publicProcedure
    .input(getUserChannelInputSchema)
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
});
