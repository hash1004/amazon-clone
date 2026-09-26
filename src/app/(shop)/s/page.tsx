import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { ProductCard } from "@/components/product-card";
import { SearchFilterProvider } from "@/components/search/search-filter-context";
import { SearchFilterToggle } from "@/components/search/search-filter-toggle";
import { SearchFilterPanel } from "@/components/search/search-filter-panel";
import { searchUrl, type SearchParams } from "@/lib/search-query";
import { SorryMug } from "@/components/ui/sorry-mug";

const PAGE_SIZE = 24;

const ROAST_LABEL: Record<string, string> = {
  light: "Light Roasts",
  medium: "Medium Roasts",
  dark: "Dark Roasts",
};

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
  if (sp.roast && ROAST_LABEL[sp.roast]) return { title: ROAST_LABEL[sp.roast] };
  if (sp.deals) return { title: "On Sale" };
  return { title: "All Coffee" };
}

function buildWhere(sp: SearchParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
      { origin: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.roast && ROAST_LABEL[sp.roast]) where.roastLevel = sp.roast.toUpperCase() as never;
  if (sp.origin) where.origin = sp.origin;
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

  // Origin facet ignores the current origin filter so you can switch origins.
  const originWhere = buildWhere({ ...sp, origin: undefined });

  const [products, total, originGroups] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: ORDER_BY[sortKey],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.product.groupBy({
      by: ["origin"],
      where: originWhere,
      _count: { origin: true },
      orderBy: { _count: { origin: "desc" } },
      take: 10,
    }),
  ]);

  const origins = originGroups.map((g) => ({
    origin: g.origin,
    count: g._count.origin,
  }));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const heading = sp.q
    ? sp.q
    : sp.roast && ROAST_LABEL[sp.roast]
      ? ROAST_LABEL[sp.roast]
      : sp.deals
        ? "On Sale"
        : "All Coffee";

  const chips: { label: string; href: string }[] = [];
  if (sp.roast && ROAST_LABEL[sp.roast] && (sp.q || sp.deals))
    chips.push({
      label: ROAST_LABEL[sp.roast],
      href: searchUrl(sp, { roast: undefined, page: undefined }),
    });
  if (sp.origin)
    chips.push({
      label: sp.origin,
      href: searchUrl(sp, { origin: undefined, page: undefined }),
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
  if (sp.deals && (sp.q || sp.roast))
    chips.push({
      label: "On sale",
      href: searchUrl(sp, { deals: undefined, page: undefined }),
    });

  const activeCount = [sp.roast, sp.origin, sp.rating, sp.min || sp.max, sp.deals].filter(
    Boolean,
  ).length;

  return (
    <SearchFilterProvider>
    <div className="bg-canvas">
      {/* Results bar */}
      <div className="border-b border-border-default bg-surface">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2 px-4 py-2">
          <SearchFilterToggle activeCount={activeCount} />
          <p className="text-sm text-text-secondary">
            {from}-{to} of {total.toLocaleString()} results
            {sp.q && (
              <>
                {" "}
                for <span className="font-bold text-text-accent">&quot;{sp.q}&quot;</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-4">
        <div className="relative">
          <SearchFilterPanel params={sp} origins={origins} />
          <div className="mb-2 border-b border-border-default pb-2">
            <h1 className="font-serif text-xl font-medium text-text-primary">
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
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-6 rounded-lg border border-border-default bg-surface p-10 text-center sm:flex-row sm:text-left">
              <SorryMug className="h-40 w-40 shrink-0" />
              <div>
                <p className="text-lg font-bold">
                  No results{sp.q ? ` for "${sp.q}"` : ""}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Check your spelling or try more general terms — or just
                  browse the whole roast list below.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link
                    href="/s"
                    className="rounded-pill bg-accent px-5 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
                  >
                    Browse all coffee
                  </Link>
                  <Link
                    href="/s?deals=1"
                    className="rounded-pill border border-border-strong px-5 py-1.5 text-sm hover:bg-subtle"
                  >
                    On Sale
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
    </SearchFilterProvider>
  );
}
