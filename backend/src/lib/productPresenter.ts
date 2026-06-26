import { Product, Category } from "@prisma/client";
import { resolveProductImageUrl } from "./storage";

export type ProductWithCategory = Product & { category?: Category | null };

export async function enrichProduct<T extends ProductWithCategory>(product: T) {
  const imageUrl = await resolveProductImageUrl(product.imagePath);
  return { ...product, imageUrl };
}

export async function enrichProducts<T extends ProductWithCategory>(products: T[]) {
  return Promise.all(products.map((product) => enrichProduct(product)));
}
