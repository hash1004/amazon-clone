"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : ["/icon.svg"];

  return (
    <div className="flex gap-3">
      {list.length > 1 && (
        <div className="flex flex-col gap-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-white transition ${
                i === active
                  ? "border-border-accent ring-1 ring-border-accent"
                  : "border-border-default hover:border-border-strong"
              }`}
            >
              <Image
                src={src}
                alt={`${title} view ${i + 1}`}
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
      <div className="relative mx-auto aspect-square w-full max-w-[420px] bg-white">
        <Image
          src={list[active]}
          alt={title}
          fill
          sizes="(max-width: 1024px) 90vw, 420px"
          priority
          className="object-contain p-2"
        />
      </div>
    </div>
  );
}
