/** Fake but stable "N+ bought in past month" line, derived from ratingCount. */
export function boughtInPastMonth(ratingCount: number): string | null {
  if (ratingCount >= 2000) return "3K+ bought in past month";
  if (ratingCount >= 900) return "2K+ bought in past month";
  if (ratingCount >= 400) return "1K+ bought in past month";
  if (ratingCount >= 150) return "500+ bought in past month";
  if (ratingCount >= 60) return "100+ bought in past month";
  return null;
}

/** Stable pseudo-random "Sponsored" flag so ~1 in 7 cards show the label. */
export function looksSponsored(id: string): boolean {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 7 === 0;
}

/** Static delivery estimate line. */
export function deliveryEstimate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return `FREE delivery ${d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`;
}

export const PRICE_BUCKETS = [
  { label: "Under $25", min: undefined, max: 2500 },
  { label: "$25 to $50", min: 2500, max: 5000 },
  { label: "$50 to $100", min: 5000, max: 10000 },
  { label: "$100 & Above", min: 10000, max: undefined },
] as const;
