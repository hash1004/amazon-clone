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
  product: { slug: string; title: string; images: string[] };
};

const INTERVAL_MS = 6000;

/**
 * Auto-advancing hero carousel — one slide per department, each a real
 * featured product. Pauses on hover. No lifestyle-photography compositing
 * (our catalog only has plain product cutouts) — a soft tint per slide
 * stands in for the backdrop photo instead. See design/redesign-v2-spec.md.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, n]);

  const go = (d: number) => setI((p) => (p + d + n) % n);
  const slide = slides[i];
  if (!slide) return null;

  return (
    <section
      className="border-b border-border-default"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
        <div
          key={`text-${i}`}
          className="flex max-w-[480px] flex-col gap-4"
          style={{ animation: "fade-in-up 450ms ease" }}
        >
          <p className="text-sm text-text-secondary">{slide.eyebrow}</p>
          <h1 className="whitespace-pre-line font-serif text-[2.4rem] font-medium leading-[1.1] tracking-tight text-text-primary sm:text-[3.25rem]">
            {slide.headline}
          </h1>
          <Link
            href={slide.href}
            className="mt-2 inline-flex w-fit items-center rounded-md bg-inverse px-6 py-3 text-sm font-medium text-text-inverse hover:opacity-90"
          >
            {slide.ctaLabel}
          </Link>

          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong hover:bg-black/5"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-strong hover:bg-black/5"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Link
          key={`image-${i}`}
          href={slide.href}
          className="relative mx-auto block aspect-[4/5] w-[260px] shrink-0 overflow-hidden rounded-[999px] sm:w-[320px]"
          style={{ background: slide.tint, animation: "fade-in-up 450ms ease" }}
        >
          <Image
            src={slide.product.images[0]}
            alt={slide.product.title}
            fill
            sizes="320px"
            className="object-contain p-10"
          />
        </Link>
      </div>
    </section>
  );
}
