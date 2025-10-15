import z from "zod/v4";

export const packageJsonSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
});
