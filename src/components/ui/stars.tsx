/**
 * Five stars filled to the nearest half. Decorative for sighted users; the
 * sr-only text carries the value, so screen readers hear "4.5 out of 5
 * stars" instead of five star glyphs.
 */
export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
      <span aria-hidden className="relative inline-block leading-none tracking-[0.1em]">
        <span className="text-border-strong">★★★★★</span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-text-accent"
          style={{ width: `${(rounded / 5) * 100}%` }}
        >
          ★★★★★
        </span>
      </span>
    </span>
  );
}
