import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { discountPct, formatPrice } from "@/lib/format";
import { DEPARTMENT_BY_SLUG } from "@/lib/departments";
import { estimateDelivery, formatDeliveryDate } from "@/lib/delivery";
import { RatingStars } from "@/components/rating-stars";
import { PriceTag } from "@/components/ui/price-tag";
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
  const eta = estimateDelivery("standard");
  const sku = `${(dept?.slug ?? product.department).slice(0, 2).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;

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
  ];

  const cartLine = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: product.images[0] ?? "",
    priceCents: product.priceCents,
  };

  return (
    <div className="mx-auto max-w-[1200px] bg-surface px-4 py-6 sm:px-8">
      <RecordView entry={cartLine} />

      <nav className="mb-4 text-xs text-text-secondary">
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

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="relative self-start">
          <ProductGallery images={product.images} title={product.title} />
          <span className="absolute right-3 top-3">
            <WishlistButton
              variant="icon"
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
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-medium leading-tight text-text-primary sm:text-[2.5rem]">
            {product.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
            <span>SKU: {sku}</span>
            <span className="text-border-strong">·</span>
            <Link href={`/s?q=${encodeURIComponent(product.brand)}`} className="link">
              Visit the {product.brand} Store
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <PriceTag cents={product.priceCents} size="lg" />
            {pct > 0 && (
              <>
                <span className="text-sm text-text-secondary line-through">
                  {formatPrice(product.listPriceCents!)}
                </span>
                <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-bold text-text-accent">
                  {pct}% off
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-text-secondary">
                ({product.ratingCount.toLocaleString()} reviews)
              </span>
            </span>
          </div>

          <p className="mt-2 text-sm">
            {!inStock ? (
              <span className="font-medium text-text-deal">Currently unavailable</span>
            ) : lowStock ? (
              <span className="font-medium text-text-deal">
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="font-medium text-success">In stock</span>
            )}
            {inStock && (
              <span className="text-text-secondary">
                {" "}
                · Free delivery by {formatDeliveryDate(eta)}
              </span>
            )}
          </p>

          <div className="mt-5">
            <AddToCart inStock={inStock} product={cartLine} />
          </div>

          <hr className="my-6 border-border-default" />

          <h2 className="mb-2 font-serif text-lg font-medium text-text-primary">
            Product description
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            {product.description}
          </p>

          {product.bullets.length > 0 && (
            <>
              <h2 className="mb-2 mt-6 font-serif text-lg font-medium text-text-primary">
                Highlights
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
                {product.bullets.map((b, i) => {
                  const idx = b.indexOf(":");
                  return (
                    <li key={i}>
                      {idx > 0 ? (
                        <>
                          <span className="font-medium text-text-primary">
                            {b.slice(0, idx)}
                          </span>
                          {b.slice(idx)}
                        </>
                      ) : (
                        b
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <h2 className="mb-2 mt-6 font-serif text-lg font-medium text-text-primary">
            Product details
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-border-default">
                  <th className="w-40 py-2 text-left align-top font-medium text-text-primary">
                    {k}
                  </th>
                  <td className="py-2 text-text-secondary">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <h2 className="mb-3 font-serif text-lg font-medium text-text-primary">
            Products related to this item
          </h2>
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
