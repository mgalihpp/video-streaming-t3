import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  addNewVideoInputSchema,
  getInfiniteVideosInputSchema,
  getRandomVideoInputSchema,
  getVideoByIdInputSchema,
  getVideoBySearchInputSchema,
  videoDetailSchema,
} from "@/lib/schema/video";
import { EngagementType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { addNewVideo, getRawVideo, updateVideo } from "@/services/videoService";
import { z } from "zod";

export const videoRouter = createTRPCRouter({
  getRandomVideo: publicProcedure
    .input(getRandomVideoInputSchema)
    .query(async ({ ctx, input }) => {
      const videosWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
          NOT: {
            id: input.excludedVideoId,
          },
        },
        include: {
          user: true,
        },
      });

      const videoViews = await Promise.all(
        videosWithUser.map(async (video) => {
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

      const indices = Array.from({ length: videoViews.length }, (_, i) => i);

      // shuffle

      for (let i = indices.length - 1; i > 0; i--) {
        if (indices[i] !== undefined) {
          const j = Math.floor(Math.random() * (i + 1));

          if (indices[j] !== undefined) {
            [indices[i], indices[j]] = [indices[j], indices[i]!];
          }
        }
      }

      const shuffleVideoWithCounts = indices.map((i) => videoViews[i]);

      const randomVideos = shuffleVideoWithCounts.slice(0, input.many);

      return { randomVideos };
    }),
  getVideobyId: publicProcedure
    .input(getVideoByIdInputSchema)
    .query(async ({ ctx, input }) => {
      let viewerHasFollowed = false;
      let viewerHasLikes = false;
      let viewerHasDislikes = false;

      try {
        const rawVideo = await getRawVideo(ctx, input.id);

        if (!rawVideo.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sorry this video does not exist",
          });
        }

        const { comments, ...videoEx } = rawVideo;

        const followers = await ctx.db.followEngagement.count({
          where: {
            followingId: rawVideo.userId,
            engagementType: EngagementType.FOLLOW,
          },
        });

        const likes = await ctx.db.videoEngagement.count({
          where: {
            videoId: rawVideo.id,
            engagementType: EngagementType.LIKE,
          },
        });

        const dislikes = await ctx.db.videoEngagement.count({
          where: {
            videoId: rawVideo.id,
            engagementType: EngagementType.DISLIKE,
          },
        });
        0;

        const views = await ctx.db.videoEngagement.count({
          where: {
            videoId: rawVideo.id,
            engagementType: EngagementType.VIEW,
          },
        });

        const commentsWithLikesAndDislikes = await Promise.all(
          comments.map(async (comment) => {
            // Fetch likes and dislikes counts in parallel
            const [likes, dislikes] = await Promise.all([
              ctx.db.commentEngagement.count({
                where: {
                  commentId: comment.id,
                  engagementType: EngagementType.LIKE,
                },
              }),
              ctx.db.commentEngagement.count({
                where: {
                  commentId: comment.id,
                  engagementType: EngagementType.DISLIKE,
                },
              }),
            ]);

            const repliesWithEngagement = await Promise.all(
              comment.replies.map(async (reply) => {
                const [likes, dislikes, user] = await Promise.all([
                  ctx.db.commentEngagement.count({
                    where: {
                      commentId: reply.id,
                      engagementType: EngagementType.LIKE,
                    },
                  }),
                  ctx.db.commentEngagement.count({
                    where: {
                      commentId: reply.id,
                      engagementType: EngagementType.DISLIKE,
                    },
                  }),
                  ctx.db.user.findUnique({
                    where: {
                      id: reply.userId,
                    },
                  }),
                ]);
                return {
                  ...reply,
                  user,
                  likes,
                  dislikes,
                };
              }),
            );

            const { replies: commentReplies, ...commentWithoutReplies } =
              comment;

            return {
              ...commentWithoutReplies,
              likes,
              dislikes,
              replies: repliesWithEngagement,
            };
          }),
        );

        if (input.viewerId && input.viewerId !== "") {
          const [like, dislike, follow] = await Promise.all([
            ctx.db.videoEngagement.findFirst({
              where: {
                videoId: rawVideo.id,
                userId: input.viewerId,
                engagementType: EngagementType.LIKE,
              },
            }),
            ctx.db.videoEngagement.findFirst({
              where: {
                videoId: rawVideo.id,
                userId: input.viewerId,
                engagementType: EngagementType.DISLIKE,
              },
            }),
            ctx.db.followEngagement.findFirst({
              where: {
                followingId: rawVideo.userId,
                followerId: input.viewerId,
              },
            }),
          ]);

          viewerHasLikes = !!like;
          viewerHasDislikes = !!dislike;
          viewerHasFollowed = !!follow;
        } else {
          viewerHasLikes = false;
          viewerHasDislikes = false;
          viewerHasFollowed = false;
        }

        const viewer = {
          hasFollowed: viewerHasFollowed,
          hasLiked: viewerHasLikes,
          hasDisliked: viewerHasDislikes,
        };

        const video = {
          ...videoEx,
          comments: commentsWithLikesAndDislikes,
          followers,
          likes,
          dislikes,
          views,
          viewer,
        };

        return { video };
      } catch (error) {
        if (error instanceof TRPCError && error.code === "NOT_FOUND") {
          // Handle server side errors to not get crash the app
          return null;
        }
      }
    }),
  addNewVideo: protectedProcedure
    .input(addNewVideoInputSchema)
    .mutation(async ({ ctx, input }) => {
      return await addNewVideo(ctx, input.videoUrl);
    }),
  updateVideo: protectedProcedure
    .input(videoDetailSchema)
    .mutation(async ({ ctx, input }) => {
      return await updateVideo(
        ctx,
        input.id!,
        input.title,
        input.description!,
        input.thumbnailUrl!,
        input.publish,
      );
    }),
  getFreshVideoById: protectedProcedure
    .input(getVideoByIdInputSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.video.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
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

      const videoWithCount = await Promise.all(
        videoWithUser.map(async (video) => {
          const views = await ctx.db.videoEngagement.count({
            where: { videoId: video.id, engagementType: EngagementType.VIEW },
          });
          return {
            ...video,
            views,
          };
        }),
      );

      return videoWithCount;
    }),
  getVideoBySearch: publicProcedure
    .input(getVideoBySearchInputSchema)
    .query(async ({ ctx, input }) => {
      const videos = await ctx.db.video.findMany({
        where: {
          publish: true,
          title: {
            contains: input.title,
          },
        },
        include: {
          user: true,
        },
      });

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

      return {
        videos: videoWithCount,
      };
    }),
  getTrendingVideos: publicProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();
    const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const trendingVideos = await ctx.db.video.findMany({
      where: {
        publish: true,
        VideoEngagement: {
          some: {
            engagementType: EngagementType.VIEW,
            createdAt: {
              gte: weekAgo,
            },
          },
        },
      },
      include: {
        user: true, // Include the user who uploaded the video
        _count: {
          select: {
            VideoEngagement: {
              where: {
                engagementType: EngagementType.VIEW,
                createdAt: {
                  gte: weekAgo,
                },
              },
            },
          },
        },
      },
      orderBy: {
        VideoEngagement: {
          _count: "desc",
        },
      },
      take: 50,
    });

    const videosWithViewCount = trendingVideos.map((video) => ({
      ...video,
      views: video._count.VideoEngagement,
    }));

    return videosWithViewCount;
  }),
  getInfiniteVideos: publicProcedure
    .input(getInfiniteVideosInputSchema)
    .query(async ({ ctx, input }) => {
      const rawVideos = await ctx.db.video.findMany({
        where: {
          publish: true,
        },
        include: {
          user: true,
          _count: {
            select: {
              VideoEngagement: {
                where: { engagementType: EngagementType.VIEW },
              },
            },
          },
        },
        take: input.limit + 1,
        skip: input.skip,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          id: "desc",
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;

      if (rawVideos.length > input.limit) {
        const nextItem = rawVideos.pop();
        nextCursor = nextItem?.id;
      }

      // Map the videos with view counts
      const videoViews = rawVideos.map((video) => ({
        ...video,
        views: video._count.VideoEngagement ?? 0,
      }));

      // Utility function to shuffle an array
      function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.min(
            Math.floor(Math.random() * (i + 1)),
            array.length - 1,
          );
          if (array[j] !== undefined) {
            [array[i], array[j]] = [array[j], array[i]!];
          }
        }
        return array;
      }

      // Shuffle the videos
      const shuffledVideos = shuffleArray(videoViews).slice(0, input.limit);

      return {
        videos: shuffledVideos,
        nextCursor,
      };
    }),
});
