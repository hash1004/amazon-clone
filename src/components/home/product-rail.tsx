"use client";

import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { useRef } from "react";
import { discountPct, formatPrice, priceParts } from "@/lib/format";
import { RatingStars } from "@/components/rating-stars";
import { PrimeBadge } from "@/components/ui/prime-badge";
import { deliveryEstimate } from "@/lib/product-display";

export type RailProduct = {
  id: string;
  slug: string;
  title: string;
  images: string[];
  priceCents: number;
  listPriceCents: number | null;
  rating: number;
  ratingCount: number;
};

const THEME = {
  default: { head: "text-text-primary", accent: "" },
  deal: { head: "text-text-deal", accent: "deal" },
  bestseller: { head: "text-text-primary", accent: "rank" },
} as const;

export function ProductRail({
  title,
  href,
  items,
  theme = "default",
}: {
  title: string;
  href: string;
  items: RailProduct[];
  theme?: keyof typeof THEME;
}) {
  const track = useRef<HTMLDivElement>(null);
  const t = THEME[theme];
  if (items.length === 0) return null;

  const scroll = (dir: number) =>
    track.current?.scrollBy({ left: dir * 640, behavior: "smooth" });

  return (
    <section
      className={`bg-surface p-4 shadow-sm ${
        theme === "deal" ? "border-t-4 border-text-deal" : ""
      }`}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className={`text-xl font-bold ${t.head}`}>
          {theme === "deal" && (
            <span className="mr-2 rounded bg-text-deal px-1.5 py-0.5 align-middle text-xs font-bold uppercase text-white">
              Deals
            </span>
          )}
          {title}
        </h2>
        <Link href={href} className="link shrink-0 text-sm">
          See all
        </Link>
      </div>

      <div className="relative">
        <div
          ref={track}
          className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p, i) => {
            const pct = discountPct(p.priceCents, p.listPriceCents);
            const { whole, frac } = priceParts(p.priceCents);
            return (
              <Link
                key={p.id}
                href={`/p/${p.slug}`}
                className="group flex w-44 shrink-0 flex-col rounded-md p-1.5 hover:bg-subtle sm:w-52"
              >
                <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-md border border-border-default bg-white">
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    sizes="208px"
                    className="object-contain p-3 transition-transform group-hover:scale-105"
                  />
                  {t.accent === "deal" && pct > 0 && (
                    <span className="absolute left-1 top-1 rounded bg-text-deal px-1 py-0.5 text-[0.7rem] font-bold text-white">
                      {pct}% off
                    </span>
                  )}
                  {t.accent === "rank" && (
                    <span className="absolute left-1 top-1 rounded bg-[#232f3e] px-1.5 py-0.5 text-[0.7rem] font-bold text-white">
                      #{i + 1}
                    </span>
                  )}
                </div>

                {t.accent === "deal" && (
                  <p className="min-h-[1rem] text-xs font-bold uppercase text-text-deal">
                    {pct > 0 ? "Limited time deal" : ""}
                  </p>
                )}

                <p className="line-clamp-2 min-h-[2rem] text-xs text-text-primary group-hover:text-text-accent">
                  {p.title}
                </p>

                <div className="mt-0.5 min-h-[1rem]">
                  <RatingStars rating={p.rating} count={p.ratingCount} />
                </div>

                <div className="mt-auto pt-1">
                  <p className="text-sm">
                    <span className="align-super text-[0.6rem]">$</span>
                    <span className="font-medium">{whole}</span>
                    <span className="align-super text-[0.6rem]">{frac}</span>
                    {pct > 0 && (
                      <span className="ml-1 text-[0.7rem] text-text-secondary line-through">
                        {formatPrice(p.listPriceCents!)}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-text-secondary">
                    <PrimeBadge />{" "}
                    {deliveryEstimate().replace("FREE delivery ", "")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-md border border-border-default bg-surface/95 px-1 py-8 text-xl shadow-sm hover:bg-subtle sm:block"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-md border border-border-default bg-surface/95 px-1 py-8 text-xl shadow-sm hover:bg-subtle sm:block"
        >
          ›
        </button>
      </div>
    </section>
  );
}
