/**
 * Derives a plausible 5-star-to-1-star breakdown from the real average
 * rating + review count — we don't have per-review data, so this isn't
 * "the real distribution," but it's computed from real numbers (not
 * random, not invented from nothing) and lands where a genuine
 * distribution for that average would: mostly clustered on/near the
 * average, tapering off the further a star count is from it. Fully
 * deterministic (same input -> same output), so no hydration mismatch.
 */
export function ratingBreakdown(
  rating: number,
  count: number,
): { star: number; count: number; pct: number }[] {
  const stars = [5, 4, 3, 2, 1];
  const weights = stars.map((k) => Math.max(0, 1 - Math.abs(k - rating) / 2));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / totalWeight) * count);

  const floored = raw.map(Math.floor);
  let remainder = count - floored.reduce((a, b) => a + b, 0);
  const byFraction = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floored];
  for (let j = 0; remainder > 0 && j < byFraction.length; j++, remainder--) {
    result[byFraction[j].i] += 1;
  }

  return stars.map((star, idx) => ({
    star,
    count: result[idx],
    pct: count > 0 ? Math.round((result[idx] / count) * 100) : 0,
  }));
}
