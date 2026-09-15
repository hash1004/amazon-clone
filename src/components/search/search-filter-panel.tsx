"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";
import { CloseIcon } from "@/components/ui/icons";
import { useSearchFilter } from "@/components/search/search-filter-context";

/**
 * Covers only the results section below the toolbar (not the header/nav
 * above it) — the parent wrapping this + the results content in
 * s/page.tsx is `relative` and starts right after the toolbar row, so
 * this panel's `absolute inset-0` lands exactly on the results area.
 * Sort lives in here too now — one trigger, one panel, instead of a
 * separate control for each.
 */
export function SearchFilterPanel({
  params,
  brands,
}: {
  params: SearchParams;
  brands: { brand: string; count: number }[];
}) {
  const { open, setOpen } = useSearchFilter();
  const close = () => setOpen(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-20 overflow-y-auto rounded-lg border border-border-default bg-surface"
    >
      <div className="mx-auto max-w-[1300px] p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-text-primary">
            Filters &amp; Sort
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-subtle"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          <FGroup title="Sort by">
            {SORTS.map((s) => (
              <FLink
                key={s.key}
                href={searchUrl(params, { sort: s.key, page: undefined })}
                active={(params.sort ?? "featured") === s.key}
                onNav={close}
              >
                {s.label}
              </FLink>
            ))}
          </FGroup>

          <FGroup title="Department">
            <FLink
              href={searchUrl(params, { dept: undefined, page: undefined })}
              active={!params.dept}
              onNav={close}
            >
              All
            </FLink>
            {DEPARTMENTS.map((d) => (
              <FLink
                key={d.slug}
                href={searchUrl(params, { dept: d.slug, page: undefined })}
                active={params.dept === d.slug}
                onNav={close}
              >
                {d.label}
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
                onNav={close}
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
                onNav={close}
              >
                {b.label}
              </FLink>
            ))}
          </FGroup>

          {brands.length > 0 && (
            <FGroup title="Brands">
              {brands.map((b) => (
                <FLink
                  key={b.brand}
                  href={searchUrl(params, {
                    brand: params.brand === b.brand ? undefined : b.brand,
                    page: undefined,
                  })}
                  active={params.brand === b.brand}
                  onNav={close}
                >
                  {b.brand}
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
              onNav={close}
            >
              On sale only
            </FLink>
          </FGroup>
        </div>

        <Link
          href={searchUrl({ q: params.q }, {})}
          onClick={close}
          className="mt-8 inline-block rounded-pill bg-accent px-5 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Clear all filters
        </Link>
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
  onNav,
  children,
}: {
  href: string;
  active: boolean;
  onNav: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNav}
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
