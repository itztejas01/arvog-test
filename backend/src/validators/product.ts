import { z } from "zod";

export const productBodySchema = z.object({
  name: z.string().min(1).max(255),
  price: z.coerce.number().positive(),
  categoryId: z.string().uuid(),
});
