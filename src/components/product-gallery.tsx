"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const list = images.length ? images : ["/icon.svg"];

  function onMove(e: React.MouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

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
              aria-label={`View image ${i + 1}`}
              className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-white transition ${
                i === active
                  ? "border-border-accent ring-1 ring-border-accent"
                  : "border-border-default hover:border-border-strong"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        <div
          ref={frameRef}
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          className="relative mx-auto aspect-square w-full max-w-[440px] cursor-crosshair bg-white"
        >
          <Image
            src={list[active]}
            alt={title}
            fill
            sizes="(max-width:1024px) 90vw, 440px"
            priority
            className="object-contain p-2"
          />
          {zoom && (
            <span
              className="pointer-events-none absolute h-24 w-24 border border-border-strong bg-black/10"
              style={{
                left: `calc(${zoom.x}% - 3rem)`,
                top: `calc(${zoom.y}% - 3rem)`,
              }}
            />
          )}
        </div>
        <p className="mt-1 text-center text-xs text-text-secondary lg:hidden">
          Tap thumbnails to change image
        </p>

        {/* Zoom panel (desktop) */}
        {zoom && (
          <div
            className="pointer-events-none absolute left-[105%] top-0 z-20 hidden h-[440px] w-[440px] border border-border-default bg-white bg-no-repeat shadow-lg lg:block"
            style={{
              backgroundImage: `url(${list[active]})`,
              backgroundSize: "200%",
              backgroundPosition: `${zoom.x}% ${zoom.y}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
