import { z } from "zod";

const getRandomVideoInputSchema = z.object({
  many: z.number().int().optional(),
  excludedVideoId: z.string().optional(),
});

const getVideoByIdInputSchema = z.object({
  id: z.string(),
  viewerId: z.string().optional(),
});

const addNewVideoInputSchema = z.object({
  videoUrl: z.string().url(),
});

const videoDetailSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Video title must be at least 2 characters"),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  publish: z.boolean().default(false),
});

const getVideoBySearchInputSchema = z.object({
  title: z.string().optional(),
});

export {
  getRandomVideoInputSchema,
  getVideoByIdInputSchema,
  addNewVideoInputSchema,
  videoDetailSchema,
  getVideoBySearchInputSchema,
};
