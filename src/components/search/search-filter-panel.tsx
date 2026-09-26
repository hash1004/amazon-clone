"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";
import { useSearchFilter } from "@/components/search/search-filter-context";

const ROAST_LEVELS = [
  { slug: "light", label: "Light" },
  { slug: "medium", label: "Medium" },
  { slug: "dark", label: "Dark" },
];

/**
 * Expands inline below the toolbar instead of overlaying the results as a
 * modal/side-panel — pushes the grid down rather than covering it. The
 * grid-template-rows 0fr/1fr trick animates to/from an unknown height
 * without measuring in JS; `min-h-0` on the inner wrapper is required for
 * that trick to actually clip during the transition instead of just
 * snapping.
 */
export function SearchFilterPanel({
  params,
  origins,
}: {
  params: SearchParams;
  origins: { origin: string; count: number }[];
}) {
  const { open, setOpen } = useSearchFilter();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="mb-4 flex flex-wrap gap-x-10 gap-y-6 border border-border-default bg-subtle p-4 sm:p-6">
          <FGroup title="Sort by">
            {SORTS.map((s) => (
              <FLink
                key={s.key}
                href={searchUrl(params, { sort: s.key, page: undefined })}
                active={(params.sort ?? "featured") === s.key}
              >
                {s.label}
              </FLink>
            ))}
          </FGroup>

          <FGroup title="Roast level">
            <FLink
              href={searchUrl(params, { roast: undefined, page: undefined })}
              active={!params.roast}
            >
              All
            </FLink>
            {ROAST_LEVELS.map((r) => (
              <FLink
                key={r.slug}
                href={searchUrl(params, { roast: r.slug, page: undefined })}
                active={params.roast === r.slug}
              >
                {r.label}
              </FLink>
            ))}
          </FGroup>

          <FGroup title="Customer reviews">
            {[4, 3].map((r) => (
              <FLink
                key={r}
                href={searchUrl(params, {
                  rating: params.rating === String(r) ? undefined : String(r),
                  page: undefined,
                })}
                active={params.rating === String(r)}
              >
                {"★".repeat(r)} &amp; Up
              </FLink>
            ))}
          </FGroup>

          <FGroup title="Price">
            {PRICE_BUCKETS.map((b) => (
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
              >
                {b.label}
              </FLink>
            ))}
          </FGroup>

          {origins.length > 0 && (
            <FGroup title="Origin">
              {origins.map((o) => (
                <FLink
                  key={o.origin}
                  href={searchUrl(params, {
                    origin: params.origin === o.origin ? undefined : o.origin,
                    page: undefined,
                  })}
                  active={params.origin === o.origin}
                >
                  {o.origin}
                </FLink>
              ))}
            </FGroup>
          )}

          <FGroup title="Deals">
            <FLink
              href={searchUrl(params, {
                deals: params.deals ? undefined : "1",
                page: undefined,
              })}
              active={!!params.deals}
            >
              On sale only
            </FLink>
          </FGroup>

          <div className="flex items-end">
            <Link
              href={searchUrl({ q: params.q }, {})}
              className="rounded-pill bg-accent px-5 py-2 text-center text-sm font-medium text-accent-fg hover:bg-accent-hover"
            >
              Clear all filters
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <div className="flex flex-col items-start gap-1.5">{children}</div>
    </div>
  );
}

function FLink({
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
