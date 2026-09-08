export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

/** Splits a price into dollars and cents for the Amazon-style superscript layout. */
export function priceParts(cents: number): { whole: string; frac: string } {
  const whole = Math.floor(cents / 100).toLocaleString("en-US");
  const frac = String(cents % 100).padStart(2, "0");
  return { whole, frac };
}

export function discountPct(priceCents: number, listCents: number | null): number {
  if (!listCents || listCents <= priceCents) return 0;
  return Math.round(((listCents - priceCents) / listCents) * 100);
}
