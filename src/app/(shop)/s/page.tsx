import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { ProductCard } from "@/components/product-card";
import { SearchFilters } from "@/components/search/search-filters";
import { searchUrl, type SearchParams } from "@/lib/search-query";
import { SorryMug } from "@/components/ui/sorry-mug";
import { searchProducts } from "@/lib/product-search";

const PAGE_SIZE = 24;

// Shown when a search finds nothing — one of each kind of thing search understands.
const POPULAR_SEARCHES = ["Ethiopia", "Chocolate", "Fruity", "Dark roast", "Natural"];

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
  return { title: "All Coffee" };
}

function buildWhere(sp: SearchParams): Prisma.ProductWhereInput {
  // The text query (sp.q) isn't a DB filter — it's ranked in memory by
  // searchProducts, see loadResults.
  const where: Prisma.ProductWhereInput = {};
  if (sp.roast && ROAST_LABEL[sp.roast]) where.roastLevel = sp.roast.toUpperCase() as never;
  if (sp.origin) where.origin = sp.origin;
  if (sp.rating) where.rating = { gte: Number(sp.rating) };
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  if (min !== undefined || max !== undefined) {
    where.priceCents = { ...(min ? { gte: min } : {}), ...(max ? { lt: max } : {}) };
  }
  return where;
}

type Product = Awaited<ReturnType<typeof db.product.findMany>>[number];

const COMPARE: Record<string, (a: Product, b: Product) => number> = {
  "price-asc": (a, b) => a.priceCents - b.priceCents,
  "price-desc": (a, b) => b.priceCents - a.priceCents,
  rating: (a, b) => b.rating - a.rating,
  newest: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
};

async function loadResults(sp: SearchParams, page: number, sortKey: string) {
  // No text query: let the database filter, sort and paginate.
  if (!sp.q) {
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
    return {
      products,
      total,
      origins: originGroups.map((g) => ({ origin: g.origin, count: g._count.origin })),
    };
  }

  // Text query: apply the non-text filters in the DB (minus origin, for the
  // facet), then rank what's left by relevance in memory.
  // Pre-sorted by the "featured" order so equal-relevance matches keep it.
  const candidates = await db.product.findMany({
    where: buildWhere({ ...sp, origin: undefined }),
    orderBy: ORDER_BY.featured,
  });
  const matched = searchProducts(candidates, sp.q).map((h) => h.product);

  const counts = new Map<string, number>();
  for (const p of matched) counts.set(p.origin, (counts.get(p.origin) ?? 0) + 1);
  const origins = [...counts]
    .map(([origin, count]) => ({ origin, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const filtered = sp.origin ? matched.filter((p) => p.origin === sp.origin) : matched;
  // "Featured" keeps relevance order; the other sorts reorder the matches.
  const sorted = COMPARE[sortKey] ? [...filtered].sort(COMPARE[sortKey]) : filtered;

  return {
    products: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    origins,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sortKey = sp.sort && ORDER_BY[sp.sort] ? sp.sort : "featured";
  const { products, total, origins } = await loadResults(sp, page, sortKey);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const heading = sp.q ? sp.q : sp.roast && ROAST_LABEL[sp.roast] ? ROAST_LABEL[sp.roast] : "All Coffee";

  const chips: { label: string; href: string }[] = [];
  if (sp.roast && ROAST_LABEL[sp.roast] && sp.q)
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

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[1400px] px-6 py-4 sm:px-10">
        <div className="mb-4">
          <SearchFilters
            params={sp}
            origins={origins}
            resultsText={
              <>
                {from}-{to} of {total.toLocaleString()} results
                {sp.q && (
                  <>
                    {" "}
                    for <span className="font-bold text-text-accent">&quot;{sp.q}&quot;</span>
                  </>
                )}
              </>
            }
          />
        </div>

        <div className="mb-2 border-b border-border-default pb-2">
          <h1 className="font-serif text-2xl font-medium text-text-primary">
            {sp.q ? `Results for "${sp.q}"` : heading}
          </h1>
          {chips.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  aria-label={`Remove filter: ${c.label}`}
                  className="inline-flex items-center gap-1 border border-border-strong bg-subtle px-2.5 py-1 text-xs hover:bg-elevated"
                >
                  {c.label}
                  <span aria-hidden className="text-text-secondary">
                    ✕
                  </span>
                </Link>
              ))}
              <Link href={searchUrl({ q: sp.q }, {})} className="link text-xs font-medium">
                Clear all
              </Link>
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-6 border border-border-default bg-surface p-10 text-center sm:flex-row sm:text-left">
            <SorryMug className="h-40 w-40 shrink-0" />
            <div>
              <p className="font-serif text-xl font-medium text-text-primary">
                No results{sp.q ? ` for "${sp.q}"` : ""}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Try fewer words, or search by origin, flavor or roast.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="text-xs text-text-muted">Try</span>
                {POPULAR_SEARCHES.map((term) => (
                  <Link
                    key={term}
                    href={searchUrl({}, { q: term })}
                    className="border border-border-strong px-3 py-1 text-xs hover:bg-subtle"
                  >
                    {term}
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link
                  href="/s"
                  className="rounded-control bg-accent px-5 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
                >
                  Browse all coffee
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
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
  );
}
