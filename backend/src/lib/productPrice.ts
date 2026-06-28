/** Matches PostgreSQL Decimal(10, 2): max absolute value is 10^8 - 0.01 */
export const MAX_PRODUCT_PRICE = 99_999_999.99;

export function normalizeProductPrice(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0 || num > MAX_PRODUCT_PRICE) {
    return null;
  }
  return Math.round(num * 100) / 100;
}

export function productPriceErrorMessage() {
  return `Price must be greater than 0 and at most ${MAX_PRODUCT_PRICE.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
