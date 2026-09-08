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
  const list = images.length ? images : ["/window.svg"];

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
              className={`relative h-12 w-12 overflow-hidden rounded-md border bg-white ${
                i === active ? "border-border-accent" : "border-border-default"
              }`}
            >
              <Image
                src={src}
                alt={`${title} view ${i + 1}`}
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-square min-w-0 flex-1 bg-white">
        <Image
          src={list[active]}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 480px"
          priority
          className="object-contain p-4"
        />
      </div>
    </div>
  );
}
