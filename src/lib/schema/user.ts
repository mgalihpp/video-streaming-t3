import { z } from "zod";

const addFollowInputSchema = z.object({
  followingId: z.string(),
});

const updateUserInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 6 characters").optional(),
  handle: z.string().min(2, "Handle must be at least 4 characters").optional(),
  image: z.string().optional(),
  backgroundImage: z.string().optional(),
  description: z.string().optional(),
});

const getUserChannelInputSchema = z.object({
  id: z.string(),
  viewerId: z.string().optional(),
});

export {
  addFollowInputSchema,
  updateUserInputSchema,
  getUserChannelInputSchema,
};
