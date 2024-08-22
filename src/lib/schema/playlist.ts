import { z } from "zod";

const createNewPlaylistInputSchema = z.object({
  title: z.string().min(2, "Playlist title must be at least 2 characters"),
  description: z.string().optional(),
});

const addVideoToPlaylistInputSchema = z.object({
  playlistId: z.string(),
  videoId: z.string(),
});

const getPlaylistsByTitleInputSchema = z.object({
  title: z.string(),
});

const getPlaylistsByUserIdInputSchema = z.object({
  userId: z.string(),
});

const getPlaylistsByIdInputSchema = z.object({
  id: z.string(),
});

export {
  createNewPlaylistInputSchema,
  addVideoToPlaylistInputSchema,
  getPlaylistsByTitleInputSchema,
  getPlaylistsByUserIdInputSchema,
  getPlaylistsByIdInputSchema,
};
