import z from "zod";

export const packageJsonSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
});
