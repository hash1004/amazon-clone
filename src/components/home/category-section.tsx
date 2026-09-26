import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/product-card";

export type CategoryProduct = ProductCardData;

/**
 * One static 4-up grid per roast level (Light/Medium/Dark) — a flat,
 * calm listing instead of horizontally-scrolling themed rails. Discounts
 * show inline on the card, quietly, instead of a red-ribboned deals rail.
 * No bestseller rank chips — rating + review count is the signal.
 *
 * Uses the same ProductCard as Search results and the PDP's related
 * items — this used to be its own one-off tile with a different price
 * layout, rating style and an unconditional QuickAdd, which meant cards
 * looked different depending on which page you were on. One component,
 * one look, everywhere.
 */
export function CategorySection({
  title,
  blurb,
  href,
  items,
}: {
  title: string;
  blurb?: string;
  href: string;
  items: CategoryProduct[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        {blurb && (
          <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">
            {blurb}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href={href}
          className="inline-flex items-center rounded-pill border border-border-strong px-6 py-2.5 text-sm font-medium text-text-primary transition hover:bg-subtle"
        >
          See more {title}
        </Link>
      </div>
    </section>
  );
}
