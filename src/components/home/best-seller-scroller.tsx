"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

type Item = { slug: string; title: string; images: string[] };

export function BestSellerScroller({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: Item[];
}) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    track.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="bg-surface p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link href={href} className="link text-sm">
          See more
        </Link>
      </div>

      <div className="relative">
        <div
          ref={track}
          className="flex gap-1 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/p/${p.slug}`}
              className="group relative h-44 w-44 shrink-0"
            >
              <Image
                src={p.images[0]}
                alt={p.title}
                fill
                sizes="176px"
                className="object-contain p-2 transition-transform group-hover:scale-105"
              />
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-md border border-border-default bg-surface/90 px-1 py-8 text-xl shadow-sm hover:bg-subtle sm:block"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-md border border-border-default bg-surface/90 px-1 py-8 text-xl shadow-sm hover:bg-subtle sm:block"
        >
          ›
        </button>
      </div>
    </section>
  );
}
