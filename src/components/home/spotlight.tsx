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
 * on hover/touch; swipe on phones, arrows + dots on desktop.
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

  useEffect(() => {
    if (paused || n <= 1) return;
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
      className="grain bg-chrome-nav text-text-on-brown"
      style={{ ["--icon-hover-bg" as string]: "rgba(243, 234, 217, 0.14)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="mx-auto grid max-w-[1400px] gap-8 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16"
        style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease-out` }}
      >
        <Link
          href={`/p/${product.slug}`}
          className="group relative block aspect-[4/3] w-full overflow-hidden border border-border-on-brown lg:order-2 lg:aspect-square"
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
          <h1 className="mt-2 font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-text-on-brown sm:text-[3.5rem]">
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

          <Link
            href={`/p/${product.slug}`}
            className="mt-7 inline-flex items-center rounded-pill bg-accent px-7 py-3 text-sm font-medium text-accent-fg transition-all duration-200 ease-out hover:scale-[1.03] hover:bg-accent-hover active:scale-[0.98]"
          >
            Shop this roast
          </Link>

          {n > 1 && (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-2">
                {products.map((p, k) => (
                  <button
                    key={p.slug}
                    type="button"
                    aria-label={`Slide ${k + 1}`}
                    onClick={() => step(k)}
                    className={`h-1.5 rounded-pill transition-all ${
                      k === i ? "w-6 bg-accent" : "w-1.5 bg-border-on-brown"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Previous"
                onClick={() => go(-1)}
                className="icon-hover flex h-8 w-8 items-center justify-center rounded-full border border-border-on-brown"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => go(1)}
                className="icon-hover flex h-8 w-8 items-center justify-center rounded-full border border-border-on-brown"
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
