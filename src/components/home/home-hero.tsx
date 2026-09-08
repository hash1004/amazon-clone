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
    <div>
      <div
        className="relative h-[280px] w-full overflow-hidden sm:h-[360px]"
        style={{ background: slide.bg }}
      >
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between gap-4 px-12">
          <div className="z-10 shrink-0">
            <h2 className="text-3xl font-bold text-[#0f1111] sm:text-4xl">
              {slide.headline}
            </h2>
            <Link
              href={slide.href}
              className="mt-3 inline-block rounded-pill bg-white px-6 py-2 text-sm font-medium text-[#0f1111] shadow-sm hover:bg-white/80"
            >
              Shop now
            </Link>
          </div>
          <div className="flex items-center gap-6">
            {slide.images.slice(0, 3).map((src, k) => (
              <div
                key={src + k}
                className={`relative h-40 w-40 sm:h-64 sm:w-64 ${
                  k === 0 ? "hidden md:block" : ""
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="256px"
                  className="object-contain drop-shadow-xl"
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
          className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded border border-transparent bg-white/30 px-1.5 py-8 text-2xl text-[#0f1111] hover:border-[#0f1111]/30 hover:bg-white/60"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded border border-transparent bg-white/30 px-1.5 py-8 text-2xl text-[#0f1111] hover:border-[#0f1111]/30 hover:bg-white/60"
        >
          ›
        </button>

        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-2">
          {slides.map((_, k) => (
            <span
              key={k}
              className={`h-1.5 w-1.5 rounded-full ${
                k === i ? "bg-[#0f1111]" : "bg-[#0f1111]/30"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="bg-subtle px-4 py-1.5 text-center text-xs text-text-secondary">
        You&apos;re browsing the Amazon clone — a working storefront built as a
        timed assignment. Browse, search, cart and checkout all work; payments
        are mocked.
      </p>
    </div>
  );
}
