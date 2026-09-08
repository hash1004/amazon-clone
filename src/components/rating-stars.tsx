export function RatingStars({
  rating,
  count,
  className = "",
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span
        className="relative text-sm leading-none text-warning"
        aria-hidden
        title={`${rating.toFixed(1)} out of 5`}
      >
        <span className="text-border-strong">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden text-warning"
          style={{ width: `${(rounded / 5) * 100}%` }}
        >
          ★★★★★
        </span>
      </span>
      {count !== undefined && (
        <span className="text-xs text-text-accent">{count.toLocaleString()}</span>
      )}
      <span className="sr-only">
        {rating.toFixed(1)} out of 5 stars
        {count !== undefined ? `, ${count} ratings` : ""}
      </span>
    </span>
  );
}
