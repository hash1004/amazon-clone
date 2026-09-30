import type { CartLine } from "@/lib/cart-store";
import { DEFAULT_GRIND, DEFAULT_SIZE, isGrind, isSize, variantFor } from "@/lib/variants";

type OrderedItem = {
  productId: string;
  titleSnapshot: string;
  imageSnapshot: string;
  quantity: number;
  grind: string;
  size: string;
  product: {
    slug: string;
    priceCents: number;
    listPriceCents: number | null;
    weightGrams: number;
  };
};

/**
 * "Buy it again": the same bag (grind and size) at today's price — the
 * order snapshot is what was paid, not what the coffee costs now.
 */
export function reorderLine(it: OrderedItem): CartLine {
  const size = isSize(it.size) ? it.size : DEFAULT_SIZE;
  const v = variantFor(it.product, size);
  return {
    productId: it.productId,
    slug: it.product.slug,
    title: it.titleSnapshot,
    image: it.imageSnapshot,
    priceCents: v.priceCents,
    quantity: it.quantity,
    grind: isGrind(it.grind) ? it.grind : DEFAULT_GRIND,
    size,
    grams: v.grams,
    units: v.units,
  };
}

/** Product fields reorderLine needs, for the order pages' Prisma include. */
export const REORDER_PRODUCT_SELECT = {
  slug: true,
  priceCents: true,
  listPriceCents: true,
  weightGrams: true,
} as const;
