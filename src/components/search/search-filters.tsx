"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";
import { FilterIcon, ChevronDownIcon } from "@/components/ui/icons";

const ROAST_LEVELS = [
  { slug: "light", label: "Light" },
  { slug: "medium", label: "Medium" },
  { slug: "dark", label: "Dark" },
];

/**
 * One "Filters & Sort" toggle that expands a single full-width panel — each
 * filter (Sort / Roast / Price / Origin) is one dropdown select,
 * not a wrapped row of pills, laid out two to a row on desktop and full
 * width, one per row, on mobile.
 */
export function SearchFilters({
  params,
  origins,
  resultsText,
}: {
  params: SearchParams;
  origins: { origin: string; count: number }[];
  resultsText: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const priceIndex = PRICE_BUCKETS.findIndex(
    (b) =>
      params.min === (b.min ? String(b.min) : undefined) &&
      params.max === (b.max ? String(b.max) : undefined),
  );

  const activeCount = [params.roast, params.origin, priceIndex >= 0 ? "1" : undefined].filter(
    Boolean,
  ).length;

  const go = (url: string) => router.push(url);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary transition hover:text-text-accent"
        >
          <FilterIcon className="h-3.5 w-3.5" />
          Filters &amp; sort
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">
              {activeCount}
            </span>
          )}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <p className="text-sm text-text-secondary">{resultsText}</p>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 border-y border-border-default py-5 sm:grid-cols-2">
            <FilterSelect
              label="Sort"
              value={params.sort ?? "featured"}
              onChange={(v) => go(searchUrl(params, { sort: v, page: undefined }))}
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Roast"
              value={params.roast ?? ""}
              onChange={(v) => go(searchUrl(params, { roast: v || undefined, page: undefined }))}
            >
              <option value="">All roasts</option>
              {ROAST_LEVELS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Price"
              value={priceIndex >= 0 ? String(priceIndex) : ""}
              onChange={(v) => {
                const b = v === "" ? undefined : PRICE_BUCKETS[Number(v)];
                go(
                  searchUrl(params, {
                    min: b?.min ? String(b.min) : undefined,
                    max: b?.max ? String(b.max) : undefined,
                    page: undefined,
                  }),
                );
              }}
            >
              <option value="">Any price</option>
              {PRICE_BUCKETS.map((b, i) => (
                <option key={b.label} value={i}>
                  {b.label}
                </option>
              ))}
            </FilterSelect>

            {origins.length > 0 && (
              <FilterSelect
                label="Origin"
                value={params.origin ?? ""}
                onChange={(v) => go(searchUrl(params, { origin: v || undefined, page: undefined }))}
              >
                <option value="">All origins</option>
                {origins.map((o) => (
                  <option key={o.origin} value={o.origin}>
                    {o.origin}
                  </option>
                ))}
              </FilterSelect>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border border-border-default bg-surface px-3 py-2 pr-8 text-sm text-text-primary outline-none transition focus-visible:border-border-accent"
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
      </div>
    </div>
  );
}
