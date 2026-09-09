import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { discountPct, formatPrice } from "@/lib/format";
import { RatingStars } from "@/components/rating-stars";
import { PriceTag } from "@/components/ui/price-tag";
import { ChoiceBadge } from "@/components/ui/badge";
import { PrimeBadge } from "@/components/ui/prime-badge";
import { boughtInPastMonth, deliveryEstimate } from "@/lib/product-display";
import { QuickAdd } from "@/components/search/quick-add";
import { WishlistButton } from "@/components/wishlist-button";

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  images: string[];
  priceCents: number;
  listPriceCents: number | null;
  rating: number;
  ratingCount: number;
  featured?: boolean;
  stock?: number;
};

export function ProductCard({
  product,
  withCart = false,
}: {
  product: ProductCardData;
  withCart?: boolean;
}) {
  const pct = discountPct(product.priceCents, product.listPriceCents);
  const bought = boughtInPastMonth(product.ratingCount);
  const inStock = product.stock === undefined ? true : product.stock > 0;

  return (
    <div className="flex h-full flex-col bg-surface p-4">
      <div className="relative mb-3">
        <Link href={`/p/${product.slug}`} className="group block">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border-default bg-white">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 280px"
              className="object-contain p-4 transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </Link>
        {pct > 0 && (
          <span className="absolute left-1 top-1 rounded bg-text-deal px-1.5 py-0.5 text-[0.7rem] font-bold text-white">
            -{pct}%
          </span>
        )}
        <span className="absolute right-1 top-1">
          <WishlistButton
            variant="icon"
            entry={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.images[0] ?? "",
              priceCents: product.priceCents,
              listPriceCents: product.listPriceCents,
              rating: product.rating,
              ratingCount: product.ratingCount,
              inStock,
            }}
          />
        </span>
      </div>

      {product.featured && (
        <div className="mb-1">
          <ChoiceBadge />
        </div>
      )}

      <Link
        href={`/p/${product.slug}`}
        className="line-clamp-2 min-h-[2.5rem] text-sm text-text-primary hover:text-text-accent-hover"
      >
        {product.title}
      </Link>

      <div className="mt-1 min-h-[1rem]">
        <RatingStars rating={product.rating} count={product.ratingCount} />
      </div>

      {withCart && (
        <p className="mt-0.5 min-h-[1rem] text-xs text-text-secondary">
          {bought ?? ""}
        </p>
      )}

      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <PriceTag cents={product.priceCents} size="md" />
        {pct > 0 && (
          <span className="text-xs text-text-secondary">
            List:{" "}
            <span className="line-through">
              {formatPrice(product.listPriceCents!)}
            </span>
          </span>
        )}
      </div>

      {withCart && (
        <div className="mt-auto pt-1.5">
          <p className="flex min-h-[1.75rem] items-start gap-1 text-xs leading-tight text-text-secondary">
            <PrimeBadge />
            <span>{deliveryEstimate()}</span>
          </p>
          <p className="min-h-[1rem] text-xs font-medium text-text-deal">
            {!inStock ? "Currently unavailable" : ""}
          </p>
          <QuickAdd
            disabled={!inStock}
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.images[0] ?? "",
              priceCents: product.priceCents,
            }}
          />
        </div>
      )}
    </div>
  );
}
