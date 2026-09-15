"use client";

import { SafeImage as Image } from "@/components/ui/safe-image";
import { useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";

const SWIPE_THRESHOLD_PX = 40;

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
  const touchStartX = useRef<number | null>(null);
  const list = images.length ? images : ["/icon.svg"];
  const n = list.length;

  function onMove(e: React.MouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setZoom({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  const go = (d: number) => setActive((p) => (p + d + n) % n);

  // Manual only — no auto-advance. A product photo isn't a marketing
  // banner; someone examining it needs to control the pace themselves.
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx < 0 ? 1 : -1);
  }

  return (
    <div className="relative">
      <div
        ref={frameRef}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="group relative aspect-square w-full cursor-crosshair touch-pan-y overflow-hidden rounded-xl border border-border-default bg-subtle"
      >
        <Image
          src={list[active]}
          alt={title}
          fill
          sizes="(max-width:1024px) 90vw, 560px"
          priority
          className="object-contain p-8"
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

        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-surface/90 p-2 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 hover:bg-surface sm:flex"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-surface/90 p-2 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 hover:bg-surface sm:flex"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2.5">
          {list.slice(0, 8).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-subtle transition sm:h-16 sm:w-16 ${
                i === active
                  ? "border-border-accent ring-1 ring-border-accent"
                  : "border-border-default hover:border-border-strong"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
              {i !== active && (
                <span className="absolute inset-0 bg-surface/50" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom panel (desktop) — overlays to the right, never widens the page */}
      {zoom && (
        <div
          className="pointer-events-none absolute left-full top-0 z-20 ml-4 hidden h-[460px] w-[380px] rounded-2xl border border-border-default bg-subtle bg-no-repeat shadow-xl xl:block"
          style={{
            backgroundImage: `url(${list[active]})`,
            backgroundSize: "220%",
            backgroundPosition: `${zoom.x}% ${zoom.y}%`,
          }}
        />
      )}
    </div>
  );
}
