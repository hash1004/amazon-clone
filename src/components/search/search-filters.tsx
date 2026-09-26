"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";
import { ChevronDownIcon } from "@/components/ui/icons";

const ROAST_LEVELS = [
  { slug: "light", label: "Light" },
  { slug: "medium", label: "Medium" },
  { slug: "dark", label: "Dark" },
];

/**
 * A row of independent dropdowns (Sort / Roast / Price / Rating / Origin)
 * instead of one big panel that opens everything at once — each one
 * manages its own open state and closes on click-outside/Escape, same
 * pattern as the header's AccountMenu.
 */
export function SearchFilters({
  params,
  origins,
}: {
  params: SearchParams;
  origins: { origin: string; count: number }[];
}) {
  const activeSort = SORTS.find((s) => s.key === params.sort);
  const roastLabel = params.roast
    ? ROAST_LEVELS.find((r) => r.slug === params.roast)?.label
    : undefined;
  const priceBucket = PRICE_BUCKETS.find(
    (b) =>
      params.min === (b.min ? String(b.min) : undefined) &&
      params.max === (b.max ? String(b.max) : undefined),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterDropdown label="Sort" value={activeSort?.label}>
        {(close) =>
          SORTS.map((s) => (
            <FLink
              key={s.key}
              href={searchUrl(params, { sort: s.key, page: undefined })}
              active={(params.sort ?? "featured") === s.key}
              onClick={close}
            >
              {s.label}
            </FLink>
          ))
        }
      </FilterDropdown>

      <FilterDropdown label="Roast" value={roastLabel}>
        {(close) => (
          <>
            <FLink
              href={searchUrl(params, { roast: undefined, page: undefined })}
              active={!params.roast}
              onClick={close}
            >
              All
            </FLink>
            {ROAST_LEVELS.map((r) => (
              <FLink
                key={r.slug}
                href={searchUrl(params, { roast: r.slug, page: undefined })}
                active={params.roast === r.slug}
                onClick={close}
              >
                {r.label}
              </FLink>
            ))}
          </>
        )}
      </FilterDropdown>

      <FilterDropdown label="Price" value={priceBucket?.label}>
        {(close) =>
          PRICE_BUCKETS.map((b) => (
            <FLink
              key={b.label}
              href={searchUrl(params, {
                min: b.min ? String(b.min) : undefined,
                max: b.max ? String(b.max) : undefined,
                page: undefined,
              })}
              active={
                params.min === (b.min ? String(b.min) : undefined) &&
                params.max === (b.max ? String(b.max) : undefined)
              }
              onClick={close}
            >
              {b.label}
            </FLink>
          ))
        }
      </FilterDropdown>

      <FilterDropdown label="Rating" value={params.rating ? `${params.rating}★ & Up` : undefined}>
        {(close) =>
          [4, 3].map((r) => (
            <FLink
              key={r}
              href={searchUrl(params, {
                rating: params.rating === String(r) ? undefined : String(r),
                page: undefined,
              })}
              active={params.rating === String(r)}
              onClick={close}
            >
              {"★".repeat(r)} &amp; Up
            </FLink>
          ))
        }
      </FilterDropdown>

      {origins.length > 0 && (
        <FilterDropdown label="Origin" value={params.origin}>
          {(close) =>
            origins.map((o) => (
              <FLink
                key={o.origin}
                href={searchUrl(params, {
                  origin: params.origin === o.origin ? undefined : o.origin,
                  page: undefined,
                })}
                active={params.origin === o.origin}
                onClick={close}
              >
                {o.origin}
              </FLink>
            ))
          }
        </FilterDropdown>
      )}
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 border px-3 py-1.5 text-sm transition ${
          value
            ? "border-border-accent text-text-accent"
            : "border-border-default text-text-primary hover:border-border-strong"
        }`}
      >
        {value ?? label}
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 min-w-[180px] border border-border-default bg-surface p-3 shadow-lg">
          <div className="flex flex-col items-start gap-1.5">{children(close)}</div>
        </div>
      )}
    </div>
  );
}

function FLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm transition ${
        active
          ? "font-medium text-text-accent"
          : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </Link>
  );
}
