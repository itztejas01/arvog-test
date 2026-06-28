import { z } from "zod";

export const reportQuerySchema = z.object({
  format: z.enum(["csv", "xlsx"]).default("csv"),
  categoryId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid().optional(),
  ),
  search: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() ? value.trim() : undefined,
    z.string().optional(),
  ),
});
