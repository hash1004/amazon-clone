"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, type SearchParams } from "@/lib/search-query";
import { FilterIcon, CloseIcon } from "@/components/ui/icons";

/**
 * Filters as a click-toggled panel anchored to the trigger (like the
 * header's Categories/Account menus) instead of a full-page dimmed
 * overlay — it opens over the results area, not the whole page (header/
 * nav stay untouched and reachable). Text+icon trigger, no border — the
 * hover color/underline is the affordance instead of a bordered chip.
 */
export function SearchControls({
  params,
  brands,
  activeCount,
}: {
  params: SearchParams;
  brands: { brand: string; count: number }[];
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

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
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary transition hover:text-text-accent"
      >
        <FilterIcon className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-80 overflow-y-auto overscroll-contain rounded-lg border border-border-default bg-surface p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium">Filters</h2>
            <button
              type="button"
              aria-label="Close filters"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-subtle"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 text-sm">
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
                  {"★".repeat(r)} & Up
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

            <Link
              href={searchUrl({ q: params.q }, {})}
              onClick={close}
              className="block rounded-pill bg-accent px-4 py-2 text-center font-medium text-accent-fg hover:bg-accent-hover"
            >
              Clear all filters
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function FGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-medium text-text-primary">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
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
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-border-accent bg-accent-subtle font-medium text-text-accent"
          : "border-border-strong hover:bg-subtle"
      }`}
    >
      {children}
    </Link>
  );
}
