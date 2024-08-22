import { z } from "zod";

const createAnnoucementInputSchema = z.object({
  message: z
    .string()
    .max(500, "Message must be at most 500 characters")
    .min(1, "Please type a message"),
});

export { createAnnoucementInputSchema };
