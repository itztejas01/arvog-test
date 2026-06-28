import { z } from "zod";
import {
  normalizeProductPrice,
  productPriceErrorMessage,
} from "../lib/productPrice";

export const productBodySchema = z.object({
  name: z.string().min(1).max(255),
  price: z.coerce
    .number()
    .refine((value) => normalizeProductPrice(value) !== null, {
      message: productPriceErrorMessage(),
    })
    .transform((value) => normalizeProductPrice(value)!),
  categoryId: z.string().uuid(),
});
