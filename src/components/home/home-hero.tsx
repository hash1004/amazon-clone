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
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-14">
          <div className="z-10 shrink-0">
            <h2 className="text-3xl font-bold leading-tight text-[#0f1111] sm:text-[2.6rem]">
              {slide.headline}
            </h2>
            <Link
              href={slide.href}
              className="mt-4 inline-block rounded-pill bg-white px-6 py-2 text-sm font-medium text-[#0f1111] shadow-sm hover:bg-white/85"
            >
              Shop now
            </Link>
          </div>
          <div className="flex items-center gap-8 pr-8">
            {slide.images.slice(0, 3).map((src, k) => (
              <div
                key={src + k}
                className={`relative h-32 w-32 sm:h-48 sm:w-48 ${
                  k === 0 ? "hidden xl:block" : "hidden sm:block"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="208px"
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
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full px-2 py-2 text-3xl text-[#0f1111]/70 hover:bg-white/40 hover:text-[#0f1111]"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full px-2 py-2 text-3xl text-[#0f1111]/70 hover:bg-white/40 hover:text-[#0f1111]"
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

    </div>
  );
}
