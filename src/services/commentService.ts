import { EngagementType, type PrismaClient } from "@prisma/client";

async function addNewComment(
  ctx: {
    db: PrismaClient;
  },
  videoId: string,
  userId: string,
  text: string,
  parentId?: string,
) {
  return await ctx.db.comment.create({
    data: {
      videoId,
      userId,
      parentId: parentId ?? null,
      message: text,
    },
  });
}

async function getComments(
  ctx: {
    db: PrismaClient;
  },
  videoId: string,
) {
  return await ctx.db.comment.findMany({
    where: {
      videoId,
    },
  });
}

async function createEngagement(
  ctx: {
    db: PrismaClient;
  },
  id: string,
  userId: string,
  type: EngagementType,
) {
  return await ctx.db.commentEngagement.create({
    data: {
      commentId: id,
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
  const existingEngagement = await ctx.db.commentEngagement.findMany({
    where: { commentId: id, userId, engagementType: type },
  });

  if (existingEngagement.length > 0) {
    await ctx.db.commentEngagement.deleteMany({
      where: { commentId: id, userId, engagementType: type },
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
  return await ctx.db.commentEngagement.findMany({
    where: {
      commentId: id,
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
  return await ctx.db.commentEngagement.findMany({
    where: {
      commentId: id,
      userId,
      engagementType: EngagementType.DISLIKE,
    },
  });
}

export {
  addNewComment,
  getComments,
  createEngagement,
  deleteEngagementIfExits,
  getExitsLike,
  getExitsDislike,
};
