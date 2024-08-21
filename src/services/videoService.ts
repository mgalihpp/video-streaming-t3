import { type PrismaClient } from "@prisma/client";
import { type Session } from "next-auth";

async function getRawVideo(ctx: { db: PrismaClient }, id: string) {
  const video = await ctx.db.video.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  const comments = await ctx.db.comment.findMany({
    where: {
      videoId: id,
      parentId: {
        equals: null,
      },
    },
    include: {
      user: true,
      replies: {
        include: {
          user: true,
          replies: true,
        },
      },
    },
  });

  return { ...video, comments };
}

async function addNewVideo(
  ctx: { db: PrismaClient; session: Session },
  videoUrl: string,
) {
  return await ctx.db.video.create({
    data: {
      title: "Untitled",
      description: "",
      thumbnailUrl: "",
      videoUrl,
      publish: false,
      userId: ctx.session.user.id,
    },
  });
}

async function updateVideo(
  ctx: { db: PrismaClient },
  id: string,
  title: string,
  description: string,
  thumbnailUrl: string,
  publish: boolean,
) {
  return await ctx.db.video.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      thumbnailUrl,
      publish,
    },
  });
}

export { getRawVideo, addNewVideo, updateVideo };
