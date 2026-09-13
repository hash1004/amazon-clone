"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

export type HeroSlide = {
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  href: string;
  tint: string;
  /** Up to 3 representative products for this department — a whole
   * category is being linked to here, not one item, so the visual should
   * read as "a cluster of things in here," not a single product. */
  products: { slug: string; title: string; images: string[] }[];
};

const INTERVAL_MS = 3800;
const FADE_MS = 260;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * Auto-advancing hero carousel — one slide per department, each fronted by
 * a small cluster of real products. Pauses on hover. No lifestyle-
 * photography compositing (our catalog only has plain product cutouts) —
 * a soft tint per slide stands in for the backdrop photo instead.
 *
 * Crossfades rather than swapping-on-remount: the old slide fades out,
 * content swaps while invisible, the new slide fades in. A key-triggered
 * CSS keyframe (the previous approach) has no exit phase, so a fast
 * interval reads as a hard cut with a fade tacked onto the entrance —
 * that's the "jerky" feeling this replaces.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  const step = (next: number) => {
    setVisible(false);
    setTimeout(() => {
      setI(next);
      setVisible(true);
    }, FADE_MS);
  };

  useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(() => step((i + 1) % n), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, n, i]);

  const go = (d: number) => step((i + d + n) % n);
  const slide = slides[i];
  if (!slide) return null;

  const fade: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transition: `opacity ${FADE_MS}ms ${EASE}`,
  };

  return (
    <section
      className="border-b border-border-default"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-12 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
        <div className="flex max-w-[480px] flex-col gap-4" style={fade}>
          <p className="text-sm text-text-secondary">{slide.eyebrow}</p>
          <h1 className="whitespace-pre-line font-serif text-[2.4rem] font-medium leading-[1.1] tracking-tight text-text-primary sm:text-[3.25rem]">
            {slide.headline}
          </h1>
          <Link
            href={slide.href}
            className="mt-2 inline-flex w-fit items-center rounded-pill bg-accent px-7 py-3 text-sm font-medium text-accent-fg transition-all duration-200 ease-out hover:scale-[1.03] hover:bg-accent-hover active:scale-[0.98]"
          >
            {slide.ctaLabel}
          </Link>

          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong transition-transform duration-150 hover:scale-105 hover:bg-black/5 active:scale-95"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong transition-transform duration-150 hover:scale-105 hover:bg-black/5 active:scale-95"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Link
          href={slide.href}
          aria-label={`Shop ${slide.eyebrow}`}
          className="relative mx-auto block h-[300px] w-[300px] shrink-0 sm:h-[360px] sm:w-[360px]"
          style={fade}
        >
          <div
            className="absolute inset-6 rounded-[2rem]"
            style={{ background: slide.tint }}
          />
          {slide.products.slice(0, 3).map((p, k) => (
            <ProductTile key={p.slug} product={p} position={k} />
          ))}
        </Link>
      </div>
    </section>
  );
}

const TILE_POSITION = [
  "left-0 top-2 h-28 w-28 -rotate-6 sm:h-32 sm:w-32",
  "bottom-2 right-0 h-28 w-28 rotate-6 sm:h-32 sm:w-32",
  "left-1/2 top-1/2 z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 sm:h-48 sm:w-48",
] as const;

/** Organic "blob" outlines instead of a rounded rectangle — different per
 * tile (reads as varied/material), same soft-blob family across all three
 * (reads as one consistent style). */
const TILE_BLOB = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "70% 30% 50% 50% / 40% 60% 40% 60%",
] as const;

function ProductTile({
  product,
  position,
}: {
  product: { slug: string; title: string; images: string[] };
  position: number;
}) {
  return (
    <div
      className={`absolute overflow-hidden border border-border-default bg-surface shadow-md ${TILE_POSITION[position]}`}
      style={{ borderRadius: TILE_BLOB[position] }}
    >
      <Image
        src={product.images[0]}
        alt={product.title}
        fill
        sizes="200px"
        className="object-contain p-3"
      />
    </div>
  );
}
