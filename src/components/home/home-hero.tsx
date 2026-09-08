"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type HeroSlide = {
  headline: string;
  href: string;
  bg: string;
  images: string[];
};

export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;

  const go = useCallback((d: number) => setI((p) => (p + d + n) % n), [n]);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);

  const slide = slides[i];

  return (
    <div className="relative h-[380px] w-full overflow-hidden sm:h-[520px]">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ background: slide.bg }}
      />
      <div className="relative mx-auto flex h-full max-w-[1500px] items-center px-10">
        <div className="z-10 max-w-xs">
          <h2 className="text-3xl font-bold text-[#0f1111] sm:text-4xl">
            {slide.headline}
          </h2>
          <Link
            href={slide.href}
            className="mt-3 inline-block rounded-pill bg-white/90 px-5 py-2 text-sm font-medium text-[#0f1111] hover:bg-white"
          >
            Shop now
          </Link>
        </div>
        <div className="pointer-events-none absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-4">
          {slide.images.slice(0, 3).map((src, k) => (
            <div key={src + k} className="relative h-40 w-40 sm:h-56 sm:w-56">
              <Image
                src={src}
                alt=""
                fill
                sizes="224px"
                className="object-contain drop-shadow-lg"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-md border border-transparent bg-white/40 px-2 py-6 text-2xl text-[#0f1111] hover:border-[#0f1111]/40 hover:bg-white/70"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-md border border-transparent bg-white/40 px-2 py-6 text-2xl text-[#0f1111] hover:border-[#0f1111]/40 hover:bg-white/70"
      >
        ›
      </button>

      {/* fade into the page's grey content area */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas" />

      <div className="absolute inset-x-0 bottom-24 z-10 mx-auto flex max-w-[1200px] justify-center px-4">
        <p className="w-full rounded bg-white/95 px-4 py-2 text-center text-xs text-text-secondary shadow-sm">
          You&apos;re browsing the Amazon clone — a working storefront built as a
          timed assignment. Payments are mocked.
        </p>
      </div>
    </div>
  );
}
