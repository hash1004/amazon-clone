import Link from "next/link";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { discountPct, priceParts } from "@/lib/format";

export type CategoryProduct = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  images: string[];
  priceCents: number;
  listPriceCents: number | null;
  rating: number;
  ratingCount: number;
};

/**
 * One static 4-up grid per department — replaces v1's horizontally
 * scrolling themed rails ("Today's Deals" / "Best Sellers" / "New
 * Arrivals" / "Top Rated" / 5× "More to explore in X", 9 rails deep).
 * Discounts show inline on the card, quietly, instead of in a separate
 * red-ribboned deals rail. No bestseller rank chips — rating + review
 * count is the signal. See design/redesign-v2-spec.md.
 */
export function CategorySection({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: CategoryProduct[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
        <Link
          href={href}
          className="text-sm text-text-accent hover:text-text-accent-hover hover:underline"
        >
          See all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductTile key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function ProductTile({ product: p }: { product: CategoryProduct }) {
  const pct = discountPct(p.priceCents, p.listPriceCents);
  const { whole, frac } = priceParts(p.priceCents);

  return (
    <Link
      href={`/p/${p.slug}`}
      className="group flex flex-col gap-2.5 rounded-lg border border-border-default bg-surface p-4 hover:border-border-strong"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-subtle">
        <Image
          src={p.images[0]}
          alt={p.title}
          fill
          sizes="(max-width: 640px) 45vw, 240px"
          className="object-contain p-4 transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <p className="text-[11px] uppercase tracking-wide text-text-muted">
        {p.brand}
      </p>
      <p className="line-clamp-2 min-h-[2.4em] text-[13px] leading-tight text-text-primary">
        {p.title}
      </p>
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-[15px] font-semibold text-text-primary">
          <span className="align-super text-[10px]">$</span>
          {whole}
          <span className="align-super text-[10px]">{frac}</span>
        </span>
        {pct > 0 && (
          <span className="rounded-full bg-accent-subtle px-1.5 py-0.5 text-[10px] font-bold text-text-accent">
            {pct}% off
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 text-[11px] text-text-muted">
        <StarGlyph />
        <span>
          {p.rating.toFixed(1)} ({p.ratingCount.toLocaleString()})
        </span>
      </div>
    </Link>
  );
}

function StarGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
    </svg>
  );
}
