import Link from "next/link";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { PriceTag } from "@/components/ui/price-tag";

export type SpotlightProduct = {
  slug: string;
  title: string;
  origin: string;
  process: string;
  tastingNotes: string[];
  images: string[];
  priceCents: number;
};

/**
 * One considered pick, not a rotating carousel — the whole catalog is a
 * dozen coffees, so there's nothing to auto-advance through. Full-bleed
 * photo on one side, tasting notes and a single CTA on the other.
 */
export function Spotlight({ product }: { product: SpotlightProduct }) {
  return (
    <section className="border-b border-border-default bg-subtle">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-10 sm:px-10 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Link
          href={`/p/${product.slug}`}
          className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-border-default bg-surface lg:order-2 lg:aspect-square"
        >
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width:1024px) 100vw, 600px"
            className="object-cover"
            priority
          />
        </Link>

        <div className="lg:order-1">
          <p className="text-sm text-text-secondary">This week&apos;s roast</p>
          <h1 className="mt-2 font-serif text-[2.25rem] font-medium italic leading-[1.1] tracking-tight text-text-primary sm:text-[3rem]">
            {product.title}
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            {product.origin} · {product.process} process
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {product.tastingNotes.map((note) => (
              <li
                key={note}
                className="rounded-pill border border-border-default bg-surface px-3 py-1 text-xs text-text-secondary"
              >
                {note}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-4">
            <PriceTag cents={product.priceCents} size="lg" />
            <Link
              href={`/p/${product.slug}`}
              className="inline-flex items-center rounded-pill bg-accent px-7 py-3 text-sm font-medium text-accent-fg transition-all duration-200 ease-out hover:scale-[1.03] hover:bg-accent-hover active:scale-[0.98]"
            >
              Shop this roast
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
