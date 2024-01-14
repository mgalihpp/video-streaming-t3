import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { EngagementType } from "@prisma/client";

export const userRouter = createTRPCRouter({
  addFollow: protectedProcedure
    .input(z.object({ followingId: z.string()}))
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
});
