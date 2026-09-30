import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { grindLabel, isGrind } from "@/lib/variants";
import { Stars } from "@/components/ui/stars";
import { ReviewForm } from "@/components/reviews/review-form";

const SHOWN = 12;

/**
 * Written reviews under the brew guide. The summary uses the product's own
 * rating figures (they include star-only ratings); the list is the written
 * reviews, newest first, with the signed-in customer's own form or review
 * on top.
 */
export async function ProductReviews({
  productId,
  slug,
  rating,
  ratingCount,
}: {
  productId: string;
  slug: string;
  rating: number;
  ratingCount: number;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const [reviews, writtenCount, mine] = await Promise.all([
    db.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: SHOWN,
    }),
    db.review.count({ where: { productId } }),
    userId
      ? db.review.findUnique({ where: { productId_userId: { productId, userId } } })
      : null,
  ]);

  const dateFmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <section id="reviews" className="mt-12 scroll-mt-20" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-serif text-xl font-medium text-text-primary">
        Reviews
      </h2>

      <div className="mt-4 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="h-fit border border-border-default bg-surface p-5">
          {ratingCount > 0 ? (
            <>
              <p className="font-serif text-4xl font-medium text-text-primary">
                {rating.toFixed(1)}
                <span className="text-base text-text-secondary"> / 5</span>
              </p>
              <Stars rating={rating} className="mt-1 text-lg" />
              <p className="mt-2 text-sm text-text-secondary">
                {ratingCount.toLocaleString()} {ratingCount === 1 ? "rating" : "ratings"}
                {writtenCount > 0 &&
                  ` · ${writtenCount.toLocaleString()} written ${writtenCount === 1 ? "review" : "reviews"}`}
              </p>
            </>
          ) : (
            <p className="text-sm text-text-secondary">No ratings yet.</p>
          )}

          <div className="mt-5 border-t border-border-default pt-4">
            {!userId ? (
              <p className="text-sm text-text-secondary">
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/p/${slug}#reviews`)}`}
                  className="link font-medium"
                >
                  Sign in
                </Link>{" "}
                to write a review.
              </p>
            ) : mine ? (
              <p className="text-sm text-text-secondary">
                Thanks, your review is below.
              </p>
            ) : (
              <ReviewForm productId={productId} />
            )}
          </div>
        </div>

        <div className="min-w-0">
          {reviews.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No written reviews yet. Tried it? Be the first to say how it brewed.
            </p>
          ) : (
            <ul className="divide-y divide-border-default border-y border-border-default">
              {reviews.map((r) => (
                <li key={r.id} className="py-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars rating={r.rating} />
                    <p className="font-medium text-text-primary">{r.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {r.authorName}
                    {r.userId && r.userId === userId && " (you)"} ·{" "}
                    <time dateTime={r.createdAt.toISOString()}>{dateFmt.format(r.createdAt)}</time>
                    {r.grind && isGrind(r.grind) && ` · Grind: ${grindLabel(r.grind)}`}
                    {r.verified && (
                      <span className="ml-2 font-medium text-success">Verified purchase</span>
                    )}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-primary">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {writtenCount > SHOWN && (
            <p className="mt-3 text-xs text-text-secondary">
              Showing the {SHOWN} most recent of {writtenCount.toLocaleString()} written reviews.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
