import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { discountPct, formatPrice } from "@/lib/format";
import { DEPARTMENT_BY_SLUG } from "@/lib/departments";
import { boughtInPastMonth } from "@/lib/product-display";
import { deliveryRange, estimateDelivery, formatDeliveryDate } from "@/lib/delivery";
import { RatingStars } from "@/components/rating-stars";
import { PriceTag } from "@/components/ui/price-tag";
import { ChoiceBadge } from "@/components/ui/badge";
import { PrimeBadge } from "@/components/ui/prime-badge";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductCard } from "@/components/product-card";
import { FrequentlyBought } from "@/components/product/frequently-bought";
import { MobileBuyBar } from "@/components/product/mobile-buy-bar";
import { RecordView } from "@/lib/recently-viewed";

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
  const lowStock = inStock && product.stock <= 10;
  const bought = boughtInPastMonth(product.ratingCount);
  const eta = estimateDelivery("standard");

  const related = await db.product.findMany({
    where: { department: product.department, id: { not: product.id } },
    orderBy: { ratingCount: "desc" },
    take: 10,
  });
  const companions = related.slice(0, 2);

  const specs: [string, string][] = [
    ["Brand", product.brand],
    ["Category", dept?.label ?? product.department],
    ["Model name", product.title.split(" ").slice(0, 4).join(" ")],
    ["Item weight", `${(0.2 + (product.priceCents % 400) / 100).toFixed(2)} kg`],
    ["Country of origin", "United States"],
    [
      "Customer reviews",
      `${product.rating.toFixed(1)} of 5 (${product.ratingCount.toLocaleString()} ratings)`,
    ],
  ];

  const cartLine = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: product.images[0] ?? "",
    priceCents: product.priceCents,
  };

  return (
    <div className="mx-auto max-w-[1400px] bg-surface px-4 py-4">
      <RecordView entry={cartLine} />

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
              M.R.P.:{" "}
              <span className="line-through">
                {formatPrice(product.listPriceCents!)}
              </span>{" "}
              <span className="text-success">
                You save {formatPrice(product.listPriceCents! - product.priceCents)}{" "}
                ({pct}%)
              </span>
            </p>
          )}
          <p className="mt-1 text-xs text-text-secondary">
            Inclusive of all taxes
          </p>

          <hr className="my-3 border-border-default" />

          <h2 className="mb-1 text-sm font-bold">About this item</h2>
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

          <h2 className="mb-1 mt-4 text-sm font-bold">Product information</h2>
          <table className="w-full text-sm">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-border-default">
                  <th className="w-40 py-1.5 text-left align-top font-bold text-text-primary">
                    {k}
                  </th>
                  <td className="py-1.5 text-text-secondary">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="mb-1 mt-4 text-sm font-bold">Product description</h2>
          <p className="text-sm text-text-secondary">{product.description}</p>
        </div>

        {/* Buy box */}
        <aside className="h-fit space-y-3">
          <div className="rounded-lg border border-border-default bg-surface p-4">
            <div className="mb-1">
              <PriceTag cents={product.priceCents} size="lg" />
            </div>
            <p className="text-sm">
              <PrimeBadge />{" "}
              <span className="text-success">
                FREE delivery {formatDeliveryDate(eta)}
              </span>
            </p>
            <p className="mb-2 text-xs text-text-secondary">
              Or fastest delivery {deliveryRange("express").split("–")[0].trim()}
            </p>
            <p className="mb-2 flex items-center gap-1 text-xs text-text-secondary">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.4.3.9.3 1.3 0 .3-.3 7.4-6.4 7.4-11.8 0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
              </svg>
              Deliver to United States
            </p>

            <p className="mb-2 text-lg font-medium">
              {!inStock ? (
                <span className="text-text-deal">Currently unavailable</span>
              ) : lowStock ? (
                <span className="text-text-deal">
                  Only {product.stock} left in stock — order soon
                </span>
              ) : (
                <span className="text-success">In Stock</span>
              )}
            </p>

            <AddToCart inStock={inStock} product={cartLine} />

            <div className="mt-2">
              <WishlistButton
                entry={{
                  productId: product.id,
                  slug: product.slug,
                  title: product.title,
                  image: product.images[0] ?? "",
                  priceCents: product.priceCents,
                  listPriceCents: product.listPriceCents,
                  rating: product.rating,
                  ratingCount: product.ratingCount,
                  inStock,
                }}
              />
            </div>

            <dl className="mt-3 space-y-1 border-t border-border-default pt-3 text-xs">
              {[
                ["Ships from", "Amazon.com"],
                ["Sold by", `${product.brand} Store`],
                ["Payment", "Secure transaction"],
                ["Packaging", "Ships in product packaging"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-text-secondary">{k}</dt>
                  <dd className="text-right text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Seller info */}
          <div className="rounded-lg border border-border-default bg-surface p-4 text-sm">
            <h2 className="mb-1 font-bold">Sold by {product.brand} Store</h2>
            <div className="flex items-center gap-1">
              <RatingStars rating={4.5} />
              <span className="text-xs text-text-secondary">
                92% positive over the last 12 months
              </span>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Ships from the Amazon.com fulfilment network. 30-day
              return/replacement policy applies.
            </p>
          </div>
        </aside>
      </div>

      <FrequentlyBought
        main={cartLine}
        companions={companions.map((p) => ({
          productId: p.id,
          slug: p.slug,
          title: p.title,
          image: p.images[0] ?? "",
          priceCents: p.priceCents,
        }))}
      />

      {related.length > 0 && (
        <section className="mt-8 border-t border-border-default pt-5">
          <h2 className="mb-3 text-lg font-bold">Products related to this item</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="pb-16 lg:pb-0" />

      <MobileBuyBar product={cartLine} inStock={inStock} />
    </div>
  );
}
