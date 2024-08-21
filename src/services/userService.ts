import { type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

async function getUser(
  ctx: {
    db: PrismaClient;
  },
  id: string,
) {
  return await ctx.db.user.findUnique({
    where: {
      id,
    },
  });
}

async function updateUser(
  ctx: {
    db: PrismaClient;
  },
  id: string,
  input: {
    name?: string;
    description?: string;
    image?: string;
    backgroundImage?: string;
  },
) {
  const user = await getUser(ctx, id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return await ctx.db.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: input.name ? input.name : user.name,
      description: input.description ? input.description : user.description,
      image: input.image ? input.image : user.image,
      backgroundImage: input.backgroundImage
        ? input.backgroundImage
        : user.backgroundImage,
    },
  });
}

async function getUserChannel(
  ctx: {
    db: PrismaClient;
  },
  input: {
    id: string;
    viewerId?: string;
  },
) {
  const user = await getUser(ctx, input.id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
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

  const userWithEngagements = {
    ...user,
    followers,
    followings,
  };

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

  return { user: userWithEngagements, viewer };
}

export { getUser, updateUser, getUserChannel };
