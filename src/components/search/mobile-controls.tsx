"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";

export function MobileSearchControls({
  params,
  brands,
}: {
  params: SearchParams;
  brands: { brand: string; count: number }[];
}) {
  const [panel, setPanel] = useState<"filters" | "sort" | null>(null);
  const router = useRouter();
  const close = () => setPanel(null);

  return (
    <div className="lg:hidden">
      <div className="sticky top-0 z-20 flex border-y border-border-default bg-surface text-sm font-medium">
        <button
          type="button"
          onClick={() => setPanel("sort")}
          className="flex-1 border-r border-border-default py-2"
        >
          ↕ Sort
        </button>
        <button
          type="button"
          onClick={() => setPanel("filters")}
          className="flex-1 py-2"
        >
          ☰ Filters
        </button>
      </div>

      {panel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {panel === "sort" ? "Sort by" : "Filters"}
              </h2>
              <button type="button" onClick={close} className="text-xl">
                ✕
              </button>
            </div>

            {panel === "sort" && (
              <ul className="space-y-1">
                {SORTS.map((s) => (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => {
                        router.push(
                          searchUrl(params, { sort: s.key, page: undefined }),
                        );
                        close();
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                        (params.sort ?? "featured") === s.key
                          ? "bg-accent-subtle font-bold"
                          : "hover:bg-subtle"
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {panel === "filters" && (
              <div className="space-y-4 text-sm">
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

                <FGroup title="Customer Reviews">
                  {[4, 3].map((r) => (
                    <FLink
                      key={r}
                      href={searchUrl(params, {
                        rating:
                          params.rating === String(r) ? undefined : String(r),
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
                          brand:
                            params.brand === b.brand ? undefined : b.brand,
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

                <Link
                  href={searchUrl({ q: params.q }, {})}
                  onClick={close}
                  className="block rounded-pill bg-accent px-4 py-2 text-center font-medium text-accent-fg"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-bold">{title}</p>
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
      className={`rounded-full border px-3 py-1 text-xs ${
        active
          ? "border-border-accent bg-accent-subtle font-bold"
          : "border-border-strong"
      }`}
    >
      {children}
    </Link>
  );
}
