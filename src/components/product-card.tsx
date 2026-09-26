import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { discountPct, formatPrice } from "@/lib/format";
import { PriceTag } from "@/components/ui/price-tag";
import { QuickAdd } from "@/components/search/quick-add";
import { WishlistButton } from "@/components/wishlist-button";

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  origin: string;
  roastLevel: "LIGHT" | "MEDIUM" | "DARK";
  images: string[];
  priceCents: number;
  listPriceCents: number | null;
  rating: number;
  ratingCount: number;
  featured?: boolean;
  stock?: number;
};

const ROAST_LABEL: Record<ProductCardData["roastLevel"], string> = {
  LIGHT: "Light roast",
  MEDIUM: "Medium roast",
  DARK: "Dark roast",
};

/**
 * Deliberately spare: image, roast+origin, title, price, add-to-cart.
 * No stars, no review count, no "bought in past month," no per-card
 * delivery estimate, no badge — those are the Amazon-shaped signals that
 * turn a card into a wall of text. One considered coffee doesn't need a
 * sales pitch on every tile.
 */
export function ProductCard({
  product,
  withCart = false,
}: {
  product: ProductCardData;
  withCart?: boolean;
}) {
  const pct = discountPct(product.priceCents, product.listPriceCents);
  const inStock = product.stock === undefined ? true : product.stock > 0;

  return (
    <div className="flex h-full flex-col bg-surface p-4">
      <div className="group relative mb-3">
        <Link href={`/p/${product.slug}`} className="block">
          <div className="relative aspect-square w-full overflow-hidden border border-border-default bg-subtle">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 280px"
              className="object-contain p-4 transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </Link>
        <span className="absolute right-1 top-1 opacity-100 transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
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

      <p className="mb-1 text-xs text-text-muted">
        {ROAST_LABEL[product.roastLevel]} · {product.origin}
      </p>

      <Link
        href={`/p/${product.slug}`}
        className="line-clamp-2 min-h-[2.5rem] text-sm text-text-primary hover:text-text-accent-hover"
      >
        {product.title}
      </Link>

      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
        <PriceTag cents={product.priceCents} size="md" />
        {pct > 0 && (
          <>
            <span className="text-xs text-text-secondary line-through">
              {formatPrice(product.listPriceCents!)}
            </span>
            <span className="bg-accent-subtle px-1.5 py-0.5 text-[0.7rem] font-bold text-text-accent">
              {pct}% off
            </span>
          </>
        )}
      </div>

      {withCart && (
        <div className="mt-auto pt-2">
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
