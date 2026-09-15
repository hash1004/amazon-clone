import { RatingStars } from "@/components/rating-stars";
import { ratingBreakdown } from "@/lib/rating-breakdown";

export function RatingSummary({
  rating,
  ratingCount,
}: {
  rating: number;
  ratingCount: number;
}) {
  const breakdown = ratingBreakdown(rating, ratingCount);

  return (
    <div className="mt-6 rounded-lg bg-subtle p-5">
      <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <span className="text-4xl font-semibold leading-none text-text-primary">
            {rating.toFixed(1)}
          </span>
          <RatingStars rating={rating} />
          <span className="text-xs text-text-secondary">
            {ratingCount.toLocaleString()} reviews
          </span>
        </div>

        <div className="min-w-[220px] flex-1 space-y-1.5">
          {breakdown.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-2.5 text-xs text-text-secondary">
              <span className="w-10 shrink-0">{star} star</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border-default">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right tabular-nums">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
