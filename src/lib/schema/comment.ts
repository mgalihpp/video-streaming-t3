import { z } from "zod";

const addCommentInputSchema = z.object({
  videoId: z.string(),
  parentId: z.string().nullable(),
  message: z
    .string()
    .min(1, "Please type a comment")
    .max(500, "Comment must be at most 500 characters"),
});

export { addCommentInputSchema };
