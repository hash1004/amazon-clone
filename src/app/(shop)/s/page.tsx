import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { ProductCard } from "@/components/product-card";
import { FilterRail } from "@/components/search/filter-rail";
import { SortSelect } from "@/components/search/sort-select";
import { MobileSearchControls } from "@/components/search/mobile-controls";
import { DEPARTMENT_BY_SLUG } from "@/lib/departments";
import { searchUrl, type SearchParams } from "@/lib/search-query";
import { SorryDog } from "@/components/ui/sorry-dog";

const PAGE_SIZE = 24;

const ORDER_BY: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  featured: { ratingCount: "desc" },
  "price-asc": { priceCents: "asc" },
  "price-desc": { priceCents: "desc" },
  rating: { rating: "desc" },
  newest: { createdAt: "desc" },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.q) return { title: `"${sp.q}"` };
  if (sp.dept && DEPARTMENT_BY_SLUG[sp.dept])
    return { title: DEPARTMENT_BY_SLUG[sp.dept].label };
  if (sp.deals) return { title: "Today's Deals" };
  return { title: "All products" };
}

function buildWhere(sp: SearchParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
      { brand: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.dept && DEPARTMENT_BY_SLUG[sp.dept]) where.department = sp.dept;
  if (sp.brand) where.brand = sp.brand;
  if (sp.deals) where.listPriceCents = { not: null };
  if (sp.rating) where.rating = { gte: Number(sp.rating) };
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  if (min !== undefined || max !== undefined) {
    where.priceCents = { ...(min ? { gte: min } : {}), ...(max ? { lt: max } : {}) };
  }
  return where;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sortKey = sp.sort && ORDER_BY[sp.sort] ? sp.sort : "featured";
  const where = buildWhere(sp);

  // Brand facet ignores the current brand filter so you can switch brands.
  const brandWhere = buildWhere({ ...sp, brand: undefined });

  const [products, total, brandGroups] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: ORDER_BY[sortKey],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.product.groupBy({
      by: ["brand"],
      where: brandWhere,
      _count: { brand: true },
      orderBy: { _count: { brand: "desc" } },
      take: 8,
    }),
  ]);

  const brands = brandGroups.map((g) => ({
    brand: g.brand,
    count: g._count.brand,
  }));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const heading = sp.q
    ? sp.q
    : sp.dept && DEPARTMENT_BY_SLUG[sp.dept]
      ? DEPARTMENT_BY_SLUG[sp.dept].label
      : sp.deals
        ? "Today's Deals"
        : "All products";

  const chips: { label: string; href: string }[] = [];
  if (sp.dept && DEPARTMENT_BY_SLUG[sp.dept] && (sp.q || sp.deals))
    chips.push({
      label: DEPARTMENT_BY_SLUG[sp.dept].label,
      href: searchUrl(sp, { dept: undefined, page: undefined }),
    });
  if (sp.brand)
    chips.push({
      label: sp.brand,
      href: searchUrl(sp, { brand: undefined, page: undefined }),
    });
  if (sp.rating)
    chips.push({
      label: `${sp.rating}★ & Up`,
      href: searchUrl(sp, { rating: undefined, page: undefined }),
    });
  if (sp.min || sp.max)
    chips.push({
      label: `${sp.min ? "$" + Number(sp.min) / 100 : "$0"} – ${
        sp.max ? "$" + Number(sp.max) / 100 : "any"
      }`,
      href: searchUrl(sp, { min: undefined, max: undefined, page: undefined }),
    });
  if (sp.deals && (sp.q || sp.dept))
    chips.push({
      label: "On sale",
      href: searchUrl(sp, { deals: undefined, page: undefined }),
    });

  return (
    <div className="bg-canvas">
      {/* Results bar */}
      <div className="border-b border-border-default bg-surface">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2 px-4 py-2">
          <p className="text-sm text-text-secondary">
            {from}-{to} of {total.toLocaleString()} results
            {sp.q && (
              <>
                {" "}
                for <span className="font-bold text-warning">&quot;{sp.q}&quot;</span>
              </>
            )}
          </p>
          <SortSelect params={sp} />
        </div>
      </div>

      <MobileSearchControls params={sp} brands={brands} />

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-4">
        <FilterRail params={sp} brands={brands} />

        <div className="min-w-0 flex-1">
          <div className="mb-2 border-b border-border-default pb-2">
            <h1 className="text-xl font-bold">
              {sp.q ? `Results for "${sp.q}"` : heading}
            </h1>
            {chips.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-subtle px-2.5 py-1 text-xs hover:bg-elevated"
                  >
                    {c.label}
                    <span aria-hidden className="text-text-secondary">
                      ✕
                    </span>
                  </Link>
                ))}
                <Link
                  href={searchUrl({ q: sp.q }, {})}
                  className="link text-xs font-medium"
                >
                  Clear all
                </Link>
              </div>
            )}
          </div>
          <p className="mb-3 text-xs text-text-secondary">
            Check each product page for other buying options.
          </p>

          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-6 rounded-lg border border-border-default bg-surface p-10 text-center sm:flex-row sm:text-left">
              <SorryDog className="h-40 w-40 shrink-0" seed={(sp.q ?? "x").length + 1} />
              <div>
                <p className="text-lg font-bold">
                  No results{sp.q ? ` for "${sp.q}"` : ""}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Check your spelling or try more general terms. Our dog
                  couldn&apos;t sniff anything out this time.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link
                    href="/s"
                    className="rounded-pill bg-accent px-5 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
                  >
                    Browse all products
                  </Link>
                  <Link
                    href="/s?deals=1"
                    className="rounded-pill border border-border-strong px-5 py-1.5 text-sm hover:bg-subtle"
                  >
                    Today&apos;s Deals
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} withCart />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              {page > 1 && (
                <Link
                  href={searchUrl(sp, { page: String(page - 1) })}
                  className="rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-subtle"
                >
                  ‹ Previous
                </Link>
              )}
              <span className="px-3 py-1.5 text-sm text-text-secondary">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={searchUrl(sp, { page: String(page + 1) })}
                  className="rounded-md border border-border-strong px-3 py-1.5 text-sm hover:bg-subtle"
                >
                  Next ›
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
