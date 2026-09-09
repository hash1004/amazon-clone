"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { formatPrice, discountPct } from "@/lib/format";
import { RatingStars } from "@/components/rating-stars";

export default function WishlistPage() {
  const { items, ready, remove } = useWishlist();
  const { add } = useCart();

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-10 text-center">
        <h1 className="text-2xl font-bold">Your List is empty</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Tap “Add to List” on any product to save it here for later.
        </p>
        <Link
          href="/s"
          className="mt-4 inline-block rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <h1 className="mb-4 border-b border-border-default pb-3 text-2xl font-bold">
        Your List{" "}
        <span className="text-sm font-normal text-text-secondary">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <ul className="divide-y divide-border-default">
        {items.map((it) => {
          const pct = discountPct(it.priceCents, it.listPriceCents);
          return (
            <li key={it.productId} className="flex gap-4 py-4">
              <Link
                href={`/p/${it.slug}`}
                className="relative h-28 w-28 shrink-0 bg-white"
              >
                {it.image && (
                  <Image
                    src={it.image}
                    alt={it.title}
                    fill
                    sizes="112px"
                    className="object-contain p-1"
                  />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/p/${it.slug}`}
                  className="line-clamp-2 text-sm font-medium hover:text-text-accent"
                >
                  {it.title}
                </Link>
                <div className="mt-1">
                  <RatingStars rating={it.rating} count={it.ratingCount} />
                </div>
                <p className="mt-1 flex items-baseline gap-2">
                  {pct > 0 && (
                    <span className="text-sm font-bold text-text-deal">
                      -{pct}%
                    </span>
                  )}
                  <span className="text-lg font-medium">
                    {formatPrice(it.priceCents)}
                  </span>
                  {pct > 0 && (
                    <span className="text-xs text-text-secondary line-through">
                      {formatPrice(it.listPriceCents!)}
                    </span>
                  )}
                </p>
                <p className="text-xs font-medium">
                  {it.inStock ? (
                    <span className="text-success">In Stock</span>
                  ) : (
                    <span className="text-text-deal">Currently unavailable</span>
                  )}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!it.inStock}
                    onClick={() => {
                      add(
                        {
                          productId: it.productId,
                          slug: it.slug,
                          title: it.title,
                          image: it.image,
                          priceCents: it.priceCents,
                        },
                        1,
                      );
                      remove(it.productId);
                    }}
                    className="rounded-pill bg-accent px-4 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
                  >
                    Move to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(it.productId)}
                    className="rounded-pill border border-border-strong px-4 py-1.5 text-xs hover:bg-subtle"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
