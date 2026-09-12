import Link from "next/link";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { discountPct, formatPrice, priceParts } from "@/lib/format";

export type SpotlightProduct = {
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
 * Replaces the v1 auto-rotating hero carousel + poster-tile grid: one
 * considered pick instead of a dozen banners competing for attention.
 * See design/redesign-v2-spec.md § Home page — module decisions.
 */
export function Spotlight({
  deptLabel,
  deptHref,
  product,
}: {
  deptLabel: string;
  deptHref: string;
  product: SpotlightProduct;
}) {
  const pct = discountPct(product.priceCents, product.listPriceCents);
  const { whole, frac } = priceParts(product.priceCents);

  return (
    <section className="border-b border-border-default">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
        <div className="flex max-w-[480px] flex-col gap-4">
          <p className="text-[13px] uppercase tracking-wider text-text-muted">
            {deptLabel} · this week
          </p>
          <h1 className="font-serif text-[2.2rem] font-medium leading-[1.15] tracking-tight text-text-primary sm:text-[2.75rem]">
            Fewer things,
            <br />
            chosen well.
          </h1>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-text-secondary">
            One pick worth your attention, instead of a dozen shouting for
            it. Everything else is still here, organized by what it is —
            not by who paid to be seen first.
          </p>
          <Link
            href={deptHref}
            className="mt-1 text-sm font-medium text-text-accent hover:text-text-accent-hover hover:underline"
          >
            Browse {deptLabel} →
          </Link>
        </div>

        <div className="flex max-w-[420px] flex-1 flex-col gap-4 rounded-xl border border-border-default bg-surface p-6">
          <Link
            href={`/p/${product.slug}`}
            className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-subtle"
          >
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-contain p-6"
            />
          </Link>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              {product.brand}
            </p>
            <Link
              href={`/p/${product.slug}`}
              className="text-base font-medium text-text-primary hover:text-text-accent"
            >
              {product.title}
            </Link>
            <div className="mt-0.5 flex items-baseline gap-2.5">
              <span className="text-xl font-semibold text-text-primary">
                <span className="align-super text-xs">$</span>
                {whole}
                <span className="align-super text-xs">{frac}</span>
              </span>
              {pct > 0 && (
                <>
                  <span className="text-[13px] text-text-secondary line-through">
                    {formatPrice(product.listPriceCents!)}
                  </span>
                  <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[11px] font-bold text-text-accent">
                    {pct}% off
                  </span>
                </>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
              <StarGlyph />
              <span>
                {product.rating.toFixed(1)} ·{" "}
                {product.ratingCount.toLocaleString()} reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StarGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z" />
    </svg>
  );
}
