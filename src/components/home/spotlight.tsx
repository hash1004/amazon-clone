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
 * dozen coffees, so there's nothing to auto-advance through. A full brown
 * block (the boldest section on the page, on purpose — this is the one
 * thing every visitor should see first) with a full-bleed photo on one
 * side, tasting notes and a single CTA on the other.
 */
export function Spotlight({ product }: { product: SpotlightProduct }) {
  return (
    <section className="grain bg-chrome-nav text-text-on-brown">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Link
          href={`/p/${product.slug}`}
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-border-on-brown lg:order-2 lg:aspect-square"
        >
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width:1024px) 100vw, 600px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority
          />
        </Link>

        <div className="lg:order-1">
          <p className="text-sm text-text-on-brown-muted">This week&apos;s roast</p>
          <h1 className="mt-2 font-serif text-[2.5rem] font-medium italic leading-[1.05] tracking-tight text-text-on-brown sm:text-[3.5rem]">
            {product.title}
          </h1>
          <p className="mt-3 text-sm text-text-on-brown-muted">
            {product.origin} · {product.process} process
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {product.tastingNotes.map((note) => (
              <li
                key={note}
                className="rounded-pill border border-border-on-brown px-3 py-1 text-xs text-text-on-brown-muted"
              >
                {note}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-center gap-4">
            <PriceTag cents={product.priceCents} size="lg" className="!text-text-on-brown" />
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
