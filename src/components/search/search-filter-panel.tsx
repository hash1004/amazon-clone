"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";
import { CloseIcon } from "@/components/ui/icons";
import { useSearchFilter } from "@/components/search/search-filter-context";

/**
 * Responsive: on phones this is a complete full-screen overlay (there's
 * no spare width to make a partial panel read as intentional rather than
 * an accidental sliver) — same treatment as the search modal. At sm+ it's
 * a narrow (max ~1/4 of the results width) side panel, not a full-bleed
 * takeover — it sits over the results grid, which is dimmed behind it.
 * The parent wrapping this + the results content in s/page.tsx is
 * `relative` and starts right below the toolbar row, so the sm+ panel's
 * `absolute` positioning lands exactly on the results area without
 * covering the header/nav above it.
 * Sort lives in here too — one trigger, one panel, instead of a
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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) close();
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
    <div className="fixed inset-0 z-[60] sm:absolute sm:z-20">
      {/* Backdrop dims the results grid behind the panel — desktop only,
          the mobile panel is a full opaque screen so there's nothing to
          dim behind it. */}
      <div className="absolute inset-0 hidden bg-black/10 sm:block" aria-hidden />

      <div
        ref={panelRef}
        className="flex h-dvh w-full flex-col overflow-y-auto bg-surface sm:absolute sm:left-0 sm:top-0 sm:h-auto sm:max-h-full sm:max-w-[320px] sm:rounded-br-lg sm:border-r sm:border-b sm:border-border-default"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-default p-4 sm:mb-5 sm:border-0 sm:p-6 sm:pb-0">
          <h2 className="font-serif text-lg font-medium text-text-primary">
            Filters &amp; Sort
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-subtle"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-4 sm:p-6 sm:pt-0">
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
          className="mx-4 mb-4 mt-2 inline-block rounded-pill bg-accent px-5 py-2 text-center text-sm font-medium text-accent-fg hover:bg-accent-hover sm:mx-6 sm:mb-6"
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
