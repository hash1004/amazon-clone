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

function allImageUrls(slides: HeroSlide[]): string[] {
  const seen = new Set<string>();
  for (const s of slides) {
    for (const p of s.products) {
      const src = p.images[0];
      if (src) seen.add(src);
    }
  }
  return [...seen];
}

/**
 * Auto-advancing hero carousel — one slide per department, each fronted by
 * a small cluster of real products. Pauses on hover. No lifestyle-
 * photography compositing (our catalog only has plain product cutouts) —
 * a soft tint per slide stands in for the backdrop photo instead.
 *
 * Crossfades rather than swapping-on-remount: the old slide fades out,
 * content swaps while invisible, the new slide fades in.
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
      {/* Only the active slide's images are in the DOM — without this, the
          browser doesn't start fetching a slide's images until we advance
          to it, which is exactly the pop-in/blank-flash this fixes. All 15
          or so images across every slide are cheap to preload up front;
          React hoists these <link> tags into <head> regardless of where
          they're rendered. */}
      {allImageUrls(slides).map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
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
          <ProductCluster
            key={i}
            products={slide.products}
            tint={slide.tint}
            preset={i % LAYOUTS.length}
          />
        </Link>
      </div>
    </section>
  );
}

/**
 * Cluster preset per slide index — varies the backdrop blob shape and each
 * tile's position/size/rotation across slides, so the arrangement doesn't
 * repeat identically every time it comes back around. Deterministic (keyed
 * off the slide index, not Math.random()) so server and client render the
 * same thing — real randomness here would just be a hydration mismatch.
 */
const LAYOUTS = [
  {
    blob: "60% 40% 30% 70% / 60% 30% 70% 40%",
    tiles: [
      { top: "18%", left: "14%", size: "h-28 w-28 sm:h-32 sm:w-32", rotate: -8 },
      { top: "78%", left: "82%", size: "h-24 w-24 sm:h-28 sm:w-28", rotate: 10 },
      { top: "52%", left: "58%", size: "h-40 w-40 sm:h-48 sm:w-48", rotate: 0 },
    ],
  },
  {
    blob: "40% 60% 65% 35% / 55% 45% 55% 45%",
    tiles: [
      { top: "22%", left: "68%", size: "h-24 w-24 sm:h-28 sm:w-28", rotate: 9 },
      { top: "80%", left: "28%", size: "h-28 w-28 sm:h-32 sm:w-32", rotate: -7 },
      { top: "45%", left: "42%", size: "h-40 w-40 sm:h-48 sm:w-48", rotate: 0 },
    ],
  },
  {
    blob: "35% 65% 55% 45% / 40% 60% 40% 60%",
    tiles: [
      { top: "16%", left: "48%", size: "h-24 w-24 sm:h-28 sm:w-28", rotate: -10 },
      { top: "70%", left: "18%", size: "h-28 w-28 sm:h-32 sm:w-32", rotate: 8 },
      { top: "58%", left: "68%", size: "h-40 w-40 sm:h-48 sm:w-48", rotate: 0 },
    ],
  },
] as const;

const FLOAT = [
  { anim: "float-b", duration: "5.5s", delay: "0s" },
  { anim: "float-b", duration: "6.5s", delay: "1.1s" },
  { anim: "float-a", duration: "7s", delay: "0.4s" },
] as const;

function ProductCluster({
  products,
  tint,
  preset,
}: {
  products: { slug: string; title: string; images: string[] }[];
  tint: string;
  preset: number;
}) {
  const layout = LAYOUTS[preset];

  return (
    <>
      <div
        className="absolute inset-6"
        style={{ background: tint, borderRadius: layout.blob }}
      />
      {products.slice(0, 3).map((p, k) => {
        const t = layout.tiles[k];
        const f = FLOAT[k];
        const isCenter = k === 2;
        return (
          <div
            key={p.slug}
            className={`absolute overflow-hidden border border-border-default bg-surface shadow-md ${t.size} ${
              isCenter ? "z-10" : ""
            }`}
            style={{
              top: t.top,
              left: t.left,
              borderRadius:
                "60% 40% 30% 70% / 60% 30% 70% 40%",
              // The center tile is anchored by its own midpoint (needs the
              // -50%/-50% translate to stay centered on `top`/`left`); the
              // two side tiles anchor by their corner instead. Either way,
              // the float keyframe re-declares this same base transform
              // each frame (that's what `--tile-rotate` is for) — an
              // animation replaces the element's transform outright, so
              // the base positioning has to live inside the keyframe too.
              ["--tile-rotate" as string]: `${t.rotate}deg`,
              transform: isCenter
                ? "translate(-50%, -50%)"
                : `rotate(${t.rotate}deg)`,
              animation: `${f.anim} ${f.duration} ${EASE} ${f.delay} infinite`,
            }}
          >
            <Image
              src={p.images[0]}
              alt={p.title}
              fill
              sizes="200px"
              className="object-contain p-3"
            />
          </div>
        );
      })}
    </>
  );
}
