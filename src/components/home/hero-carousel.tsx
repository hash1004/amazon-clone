"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
const SWIPE_THRESHOLD_PX = 40;

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
 * a small cluster of real products. Pauses on hover/touch. No lifestyle-
 * photography compositing (our catalog only has plain product cutouts) —
 * a soft tint per slide stands in for the backdrop photo instead.
 *
 * Crossfades rather than swapping-on-remount: the old slide fades out,
 * content swaps while invisible, the new slide fades in.
 *
 * Two different layouts, not one shared one squeezed to fit both: desktop
 * keeps text and the product cluster side by side with visible arrow
 * buttons; phones get a full-bleed banner with the text overlaid on the
 * image cluster and swipe instead of buttons — that's a real layout
 * difference (overlap vs. side-by-side), not something breakpoint classes
 * on the same markup can express cleanly.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
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

  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx < 0 ? 1 : -1);
  };

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

      {/* Mobile — full-bleed banner, text overlaid on the cluster, swipe */}
      <div
        className="relative h-[440px] w-full overflow-hidden lg:hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0" style={{ background: slide.tint }} />
        <div className="absolute inset-0" style={fade}>
          {slide.products.slice(0, 3).map((p, k) => (
            <MobileTile key={p.slug} product={p} position={k} preset={i % LAYOUTS.length} />
          ))}
        </div>
        <Link
          href={slide.href}
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2.5 bg-gradient-to-t from-surface via-surface/90 to-transparent px-6 pb-8 pt-16"
          style={fade}
        >
          <p className="text-sm text-text-secondary">{slide.eyebrow}</p>
          <h1 className="whitespace-pre-line font-serif text-[2rem] font-medium leading-[1.1] tracking-tight text-text-primary">
            {slide.headline}
          </h1>
          <span className="mt-1 inline-flex w-fit items-center rounded-pill bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg">
            {slide.ctaLabel}
          </span>
        </Link>
      </div>

      {/* Desktop — side by side, arrow buttons */}
      <div className="mx-auto hidden max-w-[1400px] gap-16 px-10 py-20 lg:flex lg:items-center">
        <div className="flex max-w-[480px] flex-col gap-4" style={fade}>
          <p className="text-sm text-text-secondary">{slide.eyebrow}</p>
          <h1 className="whitespace-pre-line font-serif text-[3.25rem] font-medium leading-[1.1] tracking-tight text-text-primary">
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
          className="relative mx-auto block h-[360px] w-[360px] shrink-0"
          style={fade}
        >
          <ProductCluster
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
    // Mobile: tiles kept in the upper ~55% of the banner, clear of the
    // text card anchored to the bottom — the "overlap" is deliberate
    // (the text's gradient backdrop climbs up into the cluster a little),
    // not the images and text fighting for the same space.
    mobileTiles: [
      { top: "20%", left: "18%", size: "h-24 w-24", rotate: -8 },
      { top: "16%", left: "68%", size: "h-20 w-20", rotate: 10 },
      { top: "42%", left: "42%", size: "h-32 w-32", rotate: 0 },
    ],
  },
  {
    blob: "40% 60% 65% 35% / 55% 45% 55% 45%",
    tiles: [
      { top: "22%", left: "68%", size: "h-24 w-24 sm:h-28 sm:w-28", rotate: 9 },
      { top: "80%", left: "28%", size: "h-28 w-28 sm:h-32 sm:w-32", rotate: -7 },
      { top: "45%", left: "42%", size: "h-40 w-40 sm:h-48 sm:w-48", rotate: 0 },
    ],
    mobileTiles: [
      { top: "18%", left: "62%", size: "h-20 w-20", rotate: 9 },
      { top: "22%", left: "16%", size: "h-24 w-24", rotate: -7 },
      { top: "46%", left: "40%", size: "h-32 w-32", rotate: 0 },
    ],
  },
  {
    blob: "35% 65% 55% 45% / 40% 60% 40% 60%",
    tiles: [
      { top: "16%", left: "48%", size: "h-24 w-24 sm:h-28 sm:w-28", rotate: -10 },
      { top: "70%", left: "18%", size: "h-28 w-28 sm:h-32 sm:w-32", rotate: 8 },
      { top: "58%", left: "68%", size: "h-40 w-40 sm:h-48 sm:w-48", rotate: 0 },
    ],
    mobileTiles: [
      { top: "14%", left: "40%", size: "h-20 w-20", rotate: -10 },
      { top: "20%", left: "70%", size: "h-24 w-24", rotate: 8 },
      { top: "44%", left: "20%", size: "h-32 w-32", rotate: 0 },
    ],
  },
] as const;

const FLOAT = [
  { anim: "float-b", duration: "5.5s", delay: "0s" },
  { anim: "float-b", duration: "6.5s", delay: "1.1s" },
  { anim: "float-a", duration: "7s", delay: "0.4s" },
] as const;

const TILE_BLOB = "60% 40% 30% 70% / 60% 30% 70% 40%";

function tileTransform(rotate: number, isCenter: boolean) {
  return isCenter ? "translate(-50%, -50%)" : `rotate(${rotate}deg)`;
}

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
              borderRadius: TILE_BLOB,
              // The center tile is anchored by its own midpoint (needs the
              // -50%/-50% translate to stay centered on `top`/`left`); the
              // two side tiles anchor by their corner instead. Either way,
              // the float keyframe re-declares this same base transform
              // each frame (that's what `--tile-rotate` is for) — an
              // animation replaces the element's transform outright, so
              // the base positioning has to live inside the keyframe too.
              ["--tile-rotate" as string]: `${t.rotate}deg`,
              transform: tileTransform(t.rotate, isCenter),
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

function MobileTile({
  product: p,
  position,
  preset,
}: {
  product: { slug: string; title: string; images: string[] };
  position: number;
  preset: number;
}) {
  const t = LAYOUTS[preset].mobileTiles[position];
  const f = FLOAT[position];
  const isCenter = position === 2;

  return (
    <div
      className={`absolute overflow-hidden border border-border-default bg-surface shadow-md ${t.size} ${
        isCenter ? "z-10" : ""
      }`}
      style={{
        top: t.top,
        left: t.left,
        borderRadius: TILE_BLOB,
        ["--tile-rotate" as string]: `${t.rotate}deg`,
        transform: tileTransform(t.rotate, isCenter),
        animation: `${f.anim} ${f.duration} ${EASE} ${f.delay} infinite`,
      }}
    >
      <Image src={p.images[0]} alt={p.title} fill sizes="140px" className="object-contain p-2.5" />
    </div>
  );
}
