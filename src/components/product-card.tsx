import Image from "next/image";
import Link from "next/link";
import { discountPct, priceParts } from "@/lib/format";
import { RatingStars } from "@/components/rating-stars";

export type ProductCardData = {
  slug: string;
  title: string;
  brand: string;
  images: string[];
  priceCents: number;
  listPriceCents: number | null;
  rating: number;
  ratingCount: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { whole, frac } = priceParts(product.priceCents);
  const pct = discountPct(product.priceCents, product.listPriceCents);

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex flex-col bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden bg-white">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="object-contain p-2 transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <p className="text-xs uppercase tracking-wide text-text-muted">
        {product.brand}
      </p>
      <h3 className="line-clamp-2 text-sm text-text-primary group-hover:text-text-accent">
        {product.title}
      </h3>

      <div className="mt-1">
        <RatingStars rating={product.rating} count={product.ratingCount} />
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-text-primary">
          <span className="align-super text-xs">$</span>
          <span className="text-lg font-medium">{whole}</span>
          <span className="align-super text-xs">{frac}</span>
        </span>
        {pct > 0 && (
          <>
            <span className="text-xs text-text-secondary line-through">
              ${priceParts(product.listPriceCents!).whole}
            </span>
            <span className="text-xs font-bold text-text-deal">-{pct}%</span>
          </>
        )}
      </div>
    </Link>
  );
}
