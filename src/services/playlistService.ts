import { EngagementType, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { type Session } from "next-auth";

async function getOrCreatePlaylist(
  ctx: {
    db: PrismaClient;
  },
  title: string,
  description: string,
  userId: string,
) {
  let playlist = await ctx.db.playlist.findFirst({
    where: { title, userId },
  });

  if (playlist === null || playlist === undefined) {
    playlist = await ctx.db.playlist.create({
      data: { title, description, userId },
    });
  }

  return playlist;
}

async function getVideoExitsInPlaylist(
  ctx: {
    db: PrismaClient;
  },
  playlistId: string,
  videoId: string,
) {
  return await ctx.db.playlistHasVideo.findMany({
    where: {
      playlistId,
      videoId,
    },
  });
}

async function deleteVideoFromPlaylist(
  ctx: { db: PrismaClient },
  playlistId: string,
  videoId: string,
) {
  await ctx.db.playlistHasVideo.deleteMany({
    where: {
      playlistId,
      videoId,
    },
  });
}

async function addVideoToPlaylist(
  ctx: { db: PrismaClient },
  playlistId: string,
  videoId: string,
) {
  return await ctx.db.playlistHasVideo.create({
    data: {
      playlistId,
      videoId,
    },
  });
}

async function getRawPlaylistFromTitle(
  ctx: {
    db: PrismaClient;
    session: Session;
  },
  input: {
    title: string;
  },
) {
  let rawPlaylist = await ctx.db.playlist.findFirst({
    where: {
      title: input.title,
      userId: ctx.session?.user.id,
    },
    include: {
      user: true,
      PlaylistHasVideo: {
        include: {
          video: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (rawPlaylist === null || rawPlaylist === undefined) {
    rawPlaylist = await ctx.db.playlist.create({
      data: {
        title: input.title,
        userId: ctx.session?.user.id,
      },
      include: {
        user: true,
        PlaylistHasVideo: {
          include: {
            video: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  const followers = await ctx.db.followEngagement.count({
    where: {
      followingId: rawPlaylist?.userId,
    },
  });

  const userWithFollowers = { ...rawPlaylist.user, followers };

  const videoWithCount = await Promise.all(
    rawPlaylist.PlaylistHasVideo.map(async (playlistHasVideo) => {
      const views = await ctx.db.videoEngagement.count({
        where: {
          videoId: playlistHasVideo.videoId,
          engagementType: EngagementType.VIEW,
        },
      });

      return {
        ...playlistHasVideo.video,
        views,
      };
    }),
  );

  const { PlaylistHasVideo, user, ...playlist } = rawPlaylist;

  return {
    ...playlist,
    user: userWithFollowers,
    PlaylistHasVideo: videoWithCount,
  };
}

async function getPlaylistById(
  ctx: {
    db: PrismaClient;
  },
  input: {
    id: string;
  },
) {
  const rawPlaylist = await ctx.db.playlist.findUnique({
    where: {
      id: input.id,
    },
    include: {
      user: true,
      PlaylistHasVideo: {
        include: {
          video: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
  if (!rawPlaylist)
    throw new TRPCError({
      message: "Playlist not found",
      code: "NOT_FOUND",
    });

  const followers = await ctx.db.followEngagement.count({
    where: {
      followingId: rawPlaylist.userId,
    },
  });

  const userWithFollowers = { ...rawPlaylist.user, followers };

  const videoWithCount = await Promise.all(
    rawPlaylist.PlaylistHasVideo.map(async (playlistHasVideo) => {
      const views = await ctx.db.videoEngagement.count({
        where: {
          videoId: playlistHasVideo.videoId,
          engagementType: EngagementType.VIEW,
        },
      });

      return {
        ...playlistHasVideo.video,
        views,
      };
    }),
  );

  const { PlaylistHasVideo, user, ...playlist } = rawPlaylist;

  return {
    ...playlist,
    user: userWithFollowers,
    PlaylistHasVideo: videoWithCount,
  };
}

export {
  getOrCreatePlaylist,
  getVideoExitsInPlaylist,
  deleteVideoFromPlaylist,
  addVideoToPlaylist,
  getRawPlaylistFromTitle,
  getPlaylistById,
};
