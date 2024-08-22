import { EngagementType, type PrismaClient } from "@prisma/client";

async function createEngagement(
  ctx: {
    db: PrismaClient;
  },
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
  ctx: {
    db: PrismaClient;
  },
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

async function getExitsLike(
  ctx: {
    db: PrismaClient;
  },
  userId: string,
  id: string,
) {
  return await ctx.db.videoEngagement.findMany({
    where: {
      videoId: id,
      userId,
      engagementType: EngagementType.LIKE,
    },
  });
}

async function getExitsDislike(
  ctx: {
    db: PrismaClient;
  },
  userId: string,
  id: string,
) {
  return await ctx.db.videoEngagement.findMany({
    where: {
      videoId: id,
      userId,
      engagementType: EngagementType.DISLIKE,
    },
  });
}

async function getExitsFollowing(
  ctx: {
    db: PrismaClient;
  },
  followingId: string,
  userId: string,
) {
  return await ctx.db.followEngagement.findMany({
    where: {
      followingId,
      followerId: userId,
      engagementType: EngagementType.FOLLOW,
    },
  });
}

async function deleteFollowEngagementIfExits(
  ctx: {
    db: PrismaClient;
  },
  followingId: string,
  followerId: string,
) {
  await ctx.db.followEngagement.deleteMany({
    where: {
      followingId,
      followerId,
      engagementType: EngagementType.FOLLOW,
    },
  });
}

async function createFollowEngagement(
  ctx: {
    db: PrismaClient;
  },
  followingId: string,
  followerId: string,
) {
  return await ctx.db.followEngagement.create({
    data: {
      followingId,
      followerId,
      engagementType: EngagementType.FOLLOW,
    },
  });
}

export {
  createEngagement,
  deleteEngagementIfExits,
  getExitsLike,
  getExitsDislike,
  getExitsFollowing,
  deleteFollowEngagementIfExits,
  createFollowEngagement,
};
