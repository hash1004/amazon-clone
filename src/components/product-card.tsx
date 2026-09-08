import Image from "next/image";
import Link from "next/link";
import { discountPct, formatPrice } from "@/lib/format";
import { RatingStars } from "@/components/rating-stars";
import { PriceTag } from "@/components/ui/price-tag";
import { ChoiceBadge } from "@/components/ui/badge";
import {
  boughtInPastMonth,
  deliveryEstimate,
  looksSponsored,
} from "@/lib/product-display";
import { QuickAdd } from "@/components/search/quick-add";

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

  return (
    <div className="flex flex-col bg-surface p-4">
      {withCart && looksSponsored(product.id) && (
        <p className="mb-1 text-[0.7rem] text-text-muted">Sponsored</p>
      )}

      <Link href={`/p/${product.slug}`} className="group">
        <div className="relative mb-3 aspect-square w-full bg-white">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 240px"
            className="object-contain p-2 transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {product.featured && (
          <div className="mb-1">
            <ChoiceBadge />
          </div>
        )}

        <h3 className="line-clamp-3 text-sm text-text-primary group-hover:text-text-accent-hover">
          {product.title}
        </h3>
      </Link>

      <div className="mt-1 flex items-center gap-1">
        <RatingStars rating={product.rating} count={product.ratingCount} />
      </div>

      {withCart && bought && (
        <p className="mt-0.5 text-xs text-text-secondary">{bought}</p>
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
        <>
          <p className="mt-1 text-xs text-text-secondary">
            {deliveryEstimate()}
          </p>
          <QuickAdd
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.images[0] ?? "",
              priceCents: product.priceCents,
            }}
          />
        </>
      )}
    </div>
  );
}
