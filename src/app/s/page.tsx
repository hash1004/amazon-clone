import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { ProductCard } from "@/components/product-card";
import { DEPARTMENTS, DEPARTMENT_BY_SLUG } from "@/lib/departments";

const PAGE_SIZE = 24;

type SearchParams = {
  q?: string;
  dept?: string;
  deals?: string;
  sort?: string;
  page?: string;
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

const SORTS: { key: string; label: string; orderBy: Prisma.ProductOrderByWithRelationInput }[] = [
  { key: "featured", label: "Featured", orderBy: { ratingCount: "desc" } },
  { key: "price-asc", label: "Price: Low to High", orderBy: { priceCents: "asc" } },
  { key: "price-desc", label: "Price: High to Low", orderBy: { priceCents: "desc" } },
  { key: "rating", label: "Avg. customer review", orderBy: { rating: "desc" } },
  { key: "newest", label: "Newest arrivals", orderBy: { createdAt: "desc" } },
];

function buildQuery(sp: SearchParams, overrides: Partial<SearchParams>) {
  const params = new URLSearchParams();
  const merged = { ...sp, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `/s?${s}` : "/s";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = SORTS.find((s) => s.key === sp.sort) ?? SORTS[0];

  const where: Prisma.ProductWhereInput = {};
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
      { brand: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.dept && DEPARTMENT_BY_SLUG[sp.dept]) where.department = sp.dept;
  if (sp.deals) where.listPriceCents = { not: null };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: sort.orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const heading = sp.q
    ? `Results for "${sp.q}"`
    : sp.dept && DEPARTMENT_BY_SLUG[sp.dept]
      ? DEPARTMENT_BY_SLUG[sp.dept].label
      : sp.deals
        ? "Today's Deals"
        : "All products";

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-3">
        <div>
          <h1 className="text-xl font-bold">{heading}</h1>
          <p className="text-sm text-text-secondary">
            {total.toLocaleString()} {total === 1 ? "result" : "results"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">Sort by:</span>
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={buildQuery(sp, { sort: s.key, page: undefined })}
              className={`rounded-sm px-2 py-1 ${
                s.key === sort.key
                  ? "bg-accent-subtle font-medium"
                  : "hover:underline"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-6 py-4">
        {/* Department filter rail */}
        <aside className="hidden w-48 shrink-0 lg:block">
          <h2 className="mb-2 text-sm font-bold">Department</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href={buildQuery(sp, { dept: undefined, page: undefined })}
                className={!sp.dept ? "font-bold" : "link"}
              >
                All departments
              </Link>
            </li>
            {DEPARTMENTS.map((d) => (
              <li key={d.slug}>
                <Link
                  href={buildQuery(sp, { dept: d.slug, page: undefined })}
                  className={sp.dept === d.slug ? "font-bold" : "link"}
                >
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mb-2 mt-4 text-sm font-bold">Deals</h2>
          <Link
            href={buildQuery(sp, {
              deals: sp.deals ? undefined : "1",
              page: undefined,
            })}
            className={sp.deals ? "font-bold" : "link"}
          >
            {sp.deals ? "✓ " : ""}On sale only
          </Link>
        </aside>

        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <div className="bg-surface p-10 text-center shadow-sm">
              <p className="text-lg font-bold">No results</p>
              <p className="mt-1 text-sm text-text-secondary">
                Try a different search or{" "}
                <Link href="/s" className="link">
                  browse all products
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1">
              {page > 1 && (
                <Link
                  href={buildQuery(sp, { page: String(page - 1) })}
                  className="rounded-sm border border-border-strong px-3 py-1 text-sm hover:bg-subtle"
                >
                  Previous
                </Link>
              )}
              <span className="px-3 py-1 text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={buildQuery(sp, { page: String(page + 1) })}
                  className="rounded-sm border border-border-strong px-3 py-1 text-sm hover:bg-subtle"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
