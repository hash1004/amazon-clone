/**
 * Grind and bag size — the two choices every coffee purchase needs. Shared
 * by the product page, the cart and the orders API: the browser uses it to
 * show a price, the server uses the same math to charge it, so the two can
 * never disagree.
 *
 * Stock is counted in standard bags. A large bag takes as many standard
 * bags' worth of stock as it holds (rounded up), so the stock number keeps
 * meaning "beans on the shelf" however they're packed.
 */

export const GRINDS = [
  { id: "whole", label: "Whole bean", hint: "Grind fresh at home" },
  { id: "espresso", label: "Espresso", hint: "Fine" },
  { id: "filter", label: "Drip & pour-over", hint: "Medium" },
  { id: "french-press", label: "French press", hint: "Coarse" },
] as const;

export type Grind = (typeof GRINDS)[number]["id"];

export const SIZES = ["standard", "large"] as const;
export type Size = (typeof SIZES)[number];

/** A 2 lb bag — the "large" size for every coffee. */
const LARGE_GRAMS = 907;
/** Large bags are 15% cheaper per gram than the standard bag. */
const LARGE_DISCOUNT = 0.85;

export const DEFAULT_GRIND: Grind = "whole";
export const DEFAULT_SIZE: Size = "standard";

export function isGrind(v: unknown): v is Grind {
  return GRINDS.some((g) => g.id === v);
}

export function isSize(v: unknown): v is Size {
  return SIZES.includes(v as Size);
}

export function grindLabel(grind: Grind): string {
  return GRINDS.find((g) => g.id === grind)?.label ?? "Whole bean";
}

/** US bag weights: 340 g → "12 oz", 454 g → "1 lb", 907 g → "2 lb". */
export function weightLabel(grams: number): string {
  const oz = Math.round(grams / 28.35);
  if (oz % 16 === 0) return `${oz / 16} lb`;
  return `${oz} oz`;
}

type PricedProduct = {
  priceCents: number;
  listPriceCents: number | null;
  weightGrams: number;
};

const roundTo50 = (cents: number) => Math.round(cents / 50) * 50;

/** Price, weight and stock cost of one bag of the given size. */
export function variantFor(product: PricedProduct, size: Size) {
  if (size === "standard") {
    return {
      grams: product.weightGrams,
      priceCents: product.priceCents,
      listPriceCents: product.listPriceCents,
      units: 1,
    };
  }
  const ratio = LARGE_GRAMS / product.weightGrams;
  return {
    grams: LARGE_GRAMS,
    priceCents: roundTo50(product.priceCents * ratio * LARGE_DISCOUNT),
    listPriceCents: product.listPriceCents
      ? roundTo50(product.listPriceCents * ratio * LARGE_DISCOUNT)
      : null,
    units: Math.ceil(ratio),
  };
}

/** "Whole bean · 12 oz" — the one-line description of a bag. */
export function variantSummary(grind: Grind, grams?: number): string {
  return grams ? `${grindLabel(grind)} · ${weightLabel(grams)}` : grindLabel(grind);
}
