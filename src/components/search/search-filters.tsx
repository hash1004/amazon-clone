"use client";

import { useState } from "react";
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
 * One "Filters" toggle that expands a single full-width panel with every
 * group (Sort / Roast / Price / Rating / Origin) laid out side by side —
 * not five separate floating dropdowns. Uses the grid-rows 0fr/1fr trick
 * to animate open/closed without knowing the panel's height up front.
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
  const [open, setOpen] = useState(false);

  const priceBucket = PRICE_BUCKETS.find(
    (b) =>
      params.min === (b.min ? String(b.min) : undefined) &&
      params.max === (b.max ? String(b.max) : undefined),
  );
  const activeCount = [params.roast, params.origin, params.rating, priceBucket].filter(Boolean).length;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm transition ${
            activeCount > 0
              ? "border-border-accent text-text-accent"
              : "border-border-default text-text-primary hover:border-border-strong"
          }`}
        >
          Filters
          {activeCount > 0 && <span>({activeCount})</span>}
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <p className="text-sm text-text-secondary">{resultsText}</p>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border-default py-5 sm:grid-cols-3 lg:grid-cols-5">
            <FilterGroup label="Sort">
              {SORTS.map((s) => (
                <FPill
                  key={s.key}
                  href={searchUrl(params, { sort: s.key, page: undefined })}
                  active={(params.sort ?? "featured") === s.key}
                >
                  {s.label}
                </FPill>
              ))}
            </FilterGroup>

            <FilterGroup label="Roast">
              <FPill
                href={searchUrl(params, { roast: undefined, page: undefined })}
                active={!params.roast}
              >
                All
              </FPill>
              {ROAST_LEVELS.map((r) => (
                <FPill
                  key={r.slug}
                  href={searchUrl(params, { roast: r.slug, page: undefined })}
                  active={params.roast === r.slug}
                >
                  {r.label}
                </FPill>
              ))}
            </FilterGroup>

            <FilterGroup label="Price">
              {PRICE_BUCKETS.map((b) => (
                <FPill
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
                >
                  {b.label}
                </FPill>
              ))}
            </FilterGroup>

            <FilterGroup label="Rating">
              {[4, 3].map((r) => (
                <FPill
                  key={r}
                  href={searchUrl(params, {
                    rating: params.rating === String(r) ? undefined : String(r),
                    page: undefined,
                  })}
                  active={params.rating === String(r)}
                >
                  {"★".repeat(r)} &amp; Up
                </FPill>
              ))}
            </FilterGroup>

            {origins.length > 0 && (
              <FilterGroup label="Origin">
                {origins.map((o) => (
                  <FPill
                    key={o.origin}
                    href={searchUrl(params, {
                      origin: params.origin === o.origin ? undefined : o.origin,
                      page: undefined,
                    })}
                    active={params.origin === o.origin}
                  >
                    {o.origin}
                  </FPill>
                ))}
              </FilterGroup>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-pill border px-2.5 py-1 text-xs transition ${
        active
          ? "border-border-accent bg-accent-subtle text-text-accent"
          : "border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary"
      }`}
    >
      {children}
    </Link>
  );
}
