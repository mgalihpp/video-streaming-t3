import { z } from "zod";

const addLikeCountInputSchema = z.object({
  id: z.string(),
});

const addDislikeCountInputSchema = z.object({
  id: z.string(),
});

const addViewCountInputSchema = z.object({
  id: z.string(),
});

export {
  addLikeCountInputSchema,
  addDislikeCountInputSchema,
  addViewCountInputSchema,
};
