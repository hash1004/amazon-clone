"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

export type SpotlightProduct = {
  slug: string;
  title: string;
  origin: string;
  process: string;
  tastingNotes: string[];
  images: string[];
};

const INTERVAL_MS = 5000;
const FADE_MS = 300;
const SWIPE_THRESHOLD_PX = 40;

/**
 * Auto-advancing carousel over the featured coffees — a handful of slides,
 * not nine rails; each one is the full brown block (not a tint + floating
 * product cutout) so the identity stays consistent slide to slide. Pauses
 * on hover/touch; swipe on phones, arrows + dots on desktop. Fills the first
 * screen under the sticky header (3.5rem) on phones, tablets and laptops —
 * dvh, not vh, so the mobile address bar showing/hiding doesn't resize it.
 * Below lg the image takes whatever height the text leaves; on laptops the
 * square image is capped at the viewport height so the whole slide fits.
 * Released back to content height at 3xl (1800px, past the widest laptops),
 * where a forced full screen on a big monitor just means more empty space,
 * not more drama.
 */
export function Spotlight({ products }: { products: SpotlightProduct[] }) {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const n = products.length;

  const step = (next: number) => {
    setVisible(false);
    setTimeout(() => {
      setI(next);
      setVisible(true);
    }, FADE_MS);
  };

  // No auto-advance for reduced-motion users: the slides still change on
  // arrows, dots and swipe, just never on their own.
  useEffect(() => {
    if (paused || n <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => step((i + 1) % n), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, n, i]);

  const go = (d: number) => step((i + d + n) % n);
  const product = products[i];
  if (!product) return null;

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

  return (
    <section
      className="grain flex min-h-[calc(100dvh-3.5rem)] flex-col bg-chrome-nav text-text-on-brown 3xl:min-h-0"
      style={{ ["--icon-hover-bg" as string]: "rgba(243, 234, 217, 0.14)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // Keyboard users get the same pause as a hovering mouse, so the slide
      // never changes under a focused link.
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="mx-auto grid w-full max-w-[1400px] flex-1 grid-rows-[minmax(11rem,1fr)_auto] gap-4 px-6 py-6 sm:gap-8 sm:px-10 sm:py-10 lg:grid-cols-2 lg:grid-rows-none lg:items-center lg:gap-16 lg:py-12 3xl:py-20"
        style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-out` }}
      >
        <Link
          href={`/p/${product.slug}`}
          className="group relative block w-full overflow-hidden border border-border-on-brown lg:order-2 lg:aspect-square lg:max-h-[calc(100dvh-3.5rem-6rem)] 3xl:max-h-none"
        >
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width:1024px) 100vw, 600px"
            className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
            priority
          />
        </Link>

        <div className="lg:order-1">
          <p className="text-xs text-text-on-brown-muted sm:text-sm">Featured roast</p>
          <h1 className="mt-1 font-serif text-[1.75rem] font-medium leading-[1.05] tracking-tight text-text-on-brown sm:mt-2 sm:text-[2.5rem] lg:text-[3.5rem]">
            {product.title}
          </h1>
          <p className="mt-2 text-xs text-text-on-brown-muted sm:mt-3 sm:text-sm">
            {product.origin} · {product.process} process
          </p>

          <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
            {product.tastingNotes.map((note) => (
              <li
                key={note}
                className="cursor-default rounded-control border border-border-on-brown px-2.5 py-0.5 text-[0.7rem] text-text-on-brown-muted transition-colors duration-150 ease-out hover:border-accent hover:bg-accent hover:text-accent-fg sm:px-3 sm:py-1 sm:text-xs"
              >
                {note}
              </li>
            ))}
          </ul>

          <Link
            href={`/p/${product.slug}`}
            className="mt-4 inline-flex items-center rounded-control bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg transition-colors duration-200 ease-out hover:bg-accent-hover sm:mt-7 sm:px-7 sm:py-3"
          >
            Shop this roast
          </Link>

          {/* Dots/arrows only from sm: up — phones swipe instead (see
              onTouchStart/End above), and this row was the biggest single
              contributor to the mobile layout overflowing one screen. */}
          {n > 1 && (
            <div className="mt-8 hidden items-center gap-4 sm:flex">
              <div className="flex items-center gap-2">
                {products.map((p, k) => (
                  <button
                    key={p.slug}
                    type="button"
                    aria-label={`Slide ${k + 1}`}
                    onClick={() => step(k)}
                    className={`h-1.5 rounded-control transition-all ${
                      k === i ? "w-6 bg-accent" : "w-1.5 bg-border-on-brown"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Previous"
                onClick={() => go(-1)}
                className="icon-hover flex h-8 w-8 items-center justify-center border border-border-on-brown"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => go(1)}
                className="icon-hover flex h-8 w-8 items-center justify-center border border-border-on-brown"
              >
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
