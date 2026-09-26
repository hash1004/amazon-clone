"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";
import { formatPrice, discountPct } from "@/lib/format";

export function WishlistClient() {
  const { items, ready, remove } = useWishlist();
  const { add } = useCart();
  const { toast } = useToast();

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-medium text-text-primary">
          Your list is empty
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Tap “Add to List” on any product to save it here for later.
        </p>
        <Link
          href="/s"
          className="mt-5 inline-block rounded-pill bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Browse coffee
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <h1 className="mb-4 font-serif text-2xl font-medium text-text-primary">
        Your list{" "}
        <span className="font-sans text-sm text-text-secondary">
          ({items.length} {items.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <ul className="divide-y divide-border-default rounded-lg border border-border-default bg-surface">
        {items.map((it) => {
          const pct = discountPct(it.priceCents, it.listPriceCents);
          return (
            <li key={it.productId} className="flex gap-4 p-4">
              <Link
                href={`/p/${it.slug}`}
                className="relative h-28 w-28 shrink-0 overflow-hidden border border-border-default bg-subtle"
              >
                {it.image && (
                  <Image
                    src={it.image}
                    alt={it.title}
                    fill
                    sizes="112px"
                    className="object-cover"
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
                <p className="mt-1.5 flex items-baseline gap-2">
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
                      toast("Moved to your Cart");
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
