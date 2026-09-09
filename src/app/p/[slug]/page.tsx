import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { discountPct, formatPrice } from "@/lib/format";
import { DEPARTMENT_BY_SLUG } from "@/lib/departments";
import { boughtInPastMonth } from "@/lib/product-display";
import { RatingStars } from "@/components/rating-stars";
import { PriceTag } from "@/components/ui/price-tag";
import { ChoiceBadge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  return { title: product?.title ?? "Product not found" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const dept = DEPARTMENT_BY_SLUG[product.department];
  const pct = discountPct(product.priceCents, product.listPriceCents);
  const inStock = product.stock > 0;
  const bought = boughtInPastMonth(product.ratingCount);

  const related = await db.product.findMany({
    where: { department: product.department, id: { not: product.id } },
    orderBy: { ratingCount: "desc" },
    take: 5,
  });

  const specs: [string, string][] = [
    ["Brand", product.brand],
    ["Department", dept?.label ?? product.department],
    ["Rating", `${product.rating.toFixed(1)} of 5 (${product.ratingCount})`],
    ["Availability", inStock ? `In stock — ${product.stock} units` : "Out of stock"],
    ["Ships from", "Amazon.com"],
  ];

  return (
    <div className="mx-auto max-w-[1400px] bg-surface px-4 py-4">
      <nav className="mb-3 text-xs text-text-secondary">
        <Link href="/s" className="link">
          All
        </Link>
        {dept && (
          <>
            {" › "}
            <Link href={`/s?dept=${dept.slug}`} className="link">
              {dept.label}
            </Link>
          </>
        )}
        {" › "}
        <Link href={`/s?q=${encodeURIComponent(product.brand)}`} className="link">
          {product.brand}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]">
        {/* Gallery */}
        <div className="self-start">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Info */}
        <div className="min-w-0 lg:border-x lg:border-border-default lg:px-6">
          <h1 className="text-2xl font-normal leading-tight">{product.title}</h1>
          <Link
            href={`/s?q=${encodeURIComponent(product.brand)}`}
            className="link mt-1 inline-block text-sm"
          >
            Visit the {product.brand} Store
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <RatingStars rating={product.rating} count={product.ratingCount} />
            <span className="text-xs text-text-secondary">
              {product.rating.toFixed(1)} out of 5
            </span>
          </div>
          {product.featured && (
            <div className="mt-2">
              <ChoiceBadge />
            </div>
          )}
          {bought && (
            <p className="mt-1 text-sm text-text-secondary">{bought}</p>
          )}

          <hr className="my-3 border-border-default" />

          <div className="flex items-baseline gap-2">
            {pct > 0 && (
              <span className="text-lg font-bold text-text-deal">-{pct}%</span>
            )}
            <PriceTag cents={product.priceCents} size="lg" />
          </div>
          {pct > 0 && (
            <p className="text-sm text-text-secondary">
              List Price:{" "}
              <span className="line-through">
                {formatPrice(product.listPriceCents!)}
              </span>
            </p>
          )}

          <hr className="my-3 border-border-default" />

          <table className="w-full text-sm">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-[#f0f0f0]">
                  <th className="w-32 py-1.5 text-left align-top font-bold text-text-primary">
                    {k}
                  </th>
                  <td className="py-1.5 text-text-secondary">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="mb-1 mt-4 text-sm font-bold">About this item</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
            {product.bullets.map((b, i) => {
              const idx = b.indexOf(":");
              return (
                <li key={i}>
                  {idx > 0 ? (
                    <>
                      <span className="font-bold">{b.slice(0, idx)}</span>
                      {b.slice(idx)}
                    </>
                  ) : (
                    b
                  )}
                </li>
              );
            })}
          </ul>

          <h2 className="mb-1 mt-4 text-sm font-bold">Product description</h2>
          <p className="text-sm text-text-secondary">{product.description}</p>
        </div>

        {/* Buy box */}
        <aside className="h-fit rounded-lg border border-border-default bg-surface p-4 shadow-sm">
          <div className="mb-2">
            <PriceTag cents={product.priceCents} size="lg" />
          </div>
          <p className="text-sm text-success">FREE delivery</p>
          <p className="mb-2 flex items-center gap-1 text-xs text-text-secondary">
            <span aria-hidden>📍</span> Deliver to United States
          </p>
          <p className="mb-1 text-lg font-medium">
            {inStock ? (
              <span className="text-success">In Stock</span>
            ) : (
              <span className="text-text-deal">Currently unavailable</span>
            )}
          </p>
          <AddToCart
            inStock={inStock}
            product={{
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image: product.images[0] ?? "",
              priceCents: product.priceCents,
            }}
          />
          <dl className="mt-3 space-y-1 border-t border-border-default pt-3 text-xs">
            {[
              ["Ships from", "Amazon.com"],
              ["Sold by", "Amazon.com"],
              ["Returns", "30-day refund/replacement"],
              ["Payment", "Secure transaction"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="text-right text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-8 border-t border-border-default pt-5">
          <h2 className="mb-3 text-lg font-bold">Products related to this item</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
