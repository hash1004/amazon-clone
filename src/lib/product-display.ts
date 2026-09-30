/** At or below this many bags, product pages and cards say "Only N left". */
export const LOW_STOCK_THRESHOLD = 10;

/** Price bands for the standard bag, sized to the actual catalog ($14–$21). */
export const PRICE_BUCKETS = [
  { label: "Under $17", min: undefined, max: 1700 },
  { label: "$17 to $20", min: 1700, max: 2000 },
  { label: "$20 and up", min: 2000, max: undefined },
] as const;
