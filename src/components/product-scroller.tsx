import Image from "next/image";
import Link from "next/link";
import { priceParts, discountPct } from "@/lib/format";

type Item = {
  slug: string;
  title: string;
  images: string[];
  priceCents: number;
  listPriceCents: number | null;
};

export function ProductScroller({
  title,
  href,
  items,
}: {
  title: string;
  href?: string;
  items: Item[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {href && (
          <Link href={href} className="link text-sm">
            See more
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((p) => {
          const { whole, frac } = priceParts(p.priceCents);
          const pct = discountPct(p.priceCents, p.listPriceCents);
          return (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="group flex w-36 shrink-0 flex-col"
            >
              <div className="relative mb-2 aspect-square w-full bg-white">
                <Image
                  src={p.images[0]}
                  alt={p.title}
                  fill
                  sizes="144px"
                  className="object-contain p-1 transition-transform group-hover:scale-105"
                />
              </div>
              <p className="line-clamp-2 text-xs text-text-primary group-hover:text-text-accent">
                {p.title}
              </p>
              <p className="mt-1 text-sm">
                {pct > 0 && (
                  <span className="mr-1 font-bold text-text-deal">-{pct}%</span>
                )}
                <span className="align-super text-[0.6rem]">$</span>
                <span className="font-medium">{whole}</span>
                <span className="align-super text-[0.6rem]">{frac}</span>
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
