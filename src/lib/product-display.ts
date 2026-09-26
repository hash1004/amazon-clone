export const PRICE_BUCKETS = [
  { label: "Under $25", min: undefined, max: 2500 },
  { label: "$25 to $50", min: 2500, max: 5000 },
  { label: "$50 to $100", min: 5000, max: 10000 },
  { label: "$100 & Above", min: 10000, max: undefined },
] as const;
