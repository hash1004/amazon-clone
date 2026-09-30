import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { estimateDelivery, formatDeliveryDate } from "@/lib/delivery";
import { LOW_STOCK_THRESHOLD } from "@/lib/product-display";
import { flavorProfile, FLAVOR_AXES } from "@/lib/flavor";
import { variantFor, weightLabel } from "@/lib/variants";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductCard } from "@/components/product-card";
import { Stars } from "@/components/ui/stars";
import { ProductReviews } from "@/components/reviews/product-reviews";
import { RecordView } from "@/lib/recently-viewed";

const ROAST_LABEL = { LIGHT: "Light", MEDIUM: "Medium", DARK: "Dark" } as const;

const BREW_GUIDE: Record<string, { method: string; grind: string; ratio: string; time: string }[]> = {
  LIGHT: [
    { method: "Pour-over", grind: "Medium-fine", ratio: "1:16", time: "3:00–3:30" },
    { method: "Drip", grind: "Medium", ratio: "1:17", time: "5:00" },
    { method: "AeroPress", grind: "Fine", ratio: "1:14", time: "2:00" },
  ],
  MEDIUM: [
    { method: "Pour-over", grind: "Medium-fine", ratio: "1:15", time: "2:45–3:15" },
    { method: "Drip", grind: "Medium", ratio: "1:16", time: "5:00" },
    { method: "French press", grind: "Coarse", ratio: "1:15", time: "4:00" },
  ],
  DARK: [
    { method: "Espresso", grind: "Fine", ratio: "1:2", time: "0:25–0:30" },
    { method: "French press", grind: "Coarse", ratio: "1:14", time: "4:00" },
    { method: "Moka pot", grind: "Fine", ratio: "1:10", time: "4:00–5:00" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  return { title: product?.title ?? "Coffee not found" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= LOW_STOCK_THRESHOLD;
  const eta = estimateDelivery("standard");
  const roastLabel = ROAST_LABEL[product.roastLevel];
  const profile = flavorProfile(product.slug, product.roastLevel);
  const large = variantFor(product, "large");

  const related = await db.product.findMany({
    where: { roastLevel: product.roastLevel, id: { not: product.id } },
    orderBy: { ratingCount: "desc" },
    take: 5,
  });

  const specs: [string, string][] = [
    ["Origin", product.origin],
    ["Process", product.process],
    ["Roast", `${roastLabel}, roasted to order`],
    [
      "Bag sizes",
      `${weightLabel(product.weightGrams)} (${formatPrice(product.priceCents)}) · ${weightLabel(large.grams)} (${formatPrice(large.priceCents)})`,
    ],
    ["Grinds", "Whole bean, or ground for espresso, drip & pour-over, or French press"],
  ];

  const image = product.images[0] ?? "";

  return (
    <div className="mx-auto max-w-[1400px] bg-canvas px-4 py-6 sm:px-8 lg:px-12">
      <RecordView
        entry={{
          productId: product.id,
          slug: product.slug,
          title: product.title,
          image,
          priceCents: product.priceCents,
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-secondary">
        <ol className="flex flex-wrap items-center gap-x-1.5">
          <li>
            <Link href={`/s?roast=${product.roastLevel.toLowerCase()}`} className="link">
              {roastLabel} roasts
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href={`/s?origin=${encodeURIComponent(product.origin)}`} className="link">
              {product.origin}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="text-text-primary">
            {product.title}
          </li>
        </ol>
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
                image,
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

          {product.ratingCount > 0 && (
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm hover:underline">
              <Stars rating={product.rating} />
              <span className="font-semibold text-text-primary">{product.rating.toFixed(1)}</span>
              <span className="text-text-secondary">
                ({product.ratingCount.toLocaleString()} ratings)
              </span>
            </a>
          )}

          <p className="mt-2 text-sm text-text-secondary">
            {product.origin} · {product.process} process · {roastLabel} roast
          </p>

          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tasting notes">
            {product.tastingNotes.map((note) => (
              <li
                key={note}
                className="border border-border-default bg-surface px-3 py-1 text-xs text-text-secondary"
              >
                {note}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <AddToCart
              product={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                image,
                priceCents: product.priceCents,
                listPriceCents: product.listPriceCents,
                weightGrams: product.weightGrams,
                stock: product.stock,
              }}
            />
          </div>

          <div className="mt-4 space-y-1 text-sm">
            <p>
              {!inStock ? (
                <span className="font-medium text-danger">Currently unavailable</span>
              ) : lowStock ? (
                <span className="font-medium text-warning">
                  Only {product.stock} {product.stock === 1 ? "bag" : "bags"} left
                </span>
              ) : (
                <span className="font-medium text-text-primary">In stock</span>
              )}
              {inStock && (
                <span className="text-text-secondary">
                  {" "}
                  · Free delivery by {formatDeliveryDate(eta)}
                </span>
              )}
            </p>
            <p className="text-text-secondary">
              Roasted to order and shipped within 48 hours of roasting.
            </p>
          </div>

          <h2 className="mb-2 mt-8 font-serif text-lg font-medium text-text-primary">
            About this coffee
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">{product.description}</p>

          <h2 className="mb-3 mt-6 font-serif text-lg font-medium text-text-primary">
            Flavor profile
          </h2>
          <dl className="space-y-3">
            {FLAVOR_AXES.map((axis) => {
              const value = profile[axis.key];
              return (
                <div key={axis.key} className="grid grid-cols-[6rem_1fr] items-center gap-3 text-sm">
                  <dt className="text-text-secondary">{axis.label}</dt>
                  <dd>
                    <span className="sr-only">
                      {value} out of 5 ({value >= 4 ? axis.high : value <= 2 ? axis.low : "Medium"})
                    </span>
                    <span aria-hidden className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`h-2 flex-1 ${n <= value ? "bg-accent" : "bg-border-default"}`}
                        />
                      ))}
                    </span>
                    <span aria-hidden className="mt-1 flex justify-between text-xs text-text-muted">
                      <span>{axis.low}</span>
                      <span>{axis.high}</span>
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>

          <h2 className="mb-3 mt-6 font-serif text-lg font-medium text-text-primary">
            Details
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="brew-guide">
        <h2 id="brew-guide" className="mb-4 font-serif text-xl font-medium text-text-primary">
          Brew guide
        </h2>
        <div className="grain overflow-x-auto bg-chrome-nav text-text-on-brown">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-on-brown text-left text-xs uppercase tracking-wide text-text-on-brown-muted">
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Grind</th>
                <th className="px-5 py-3 font-medium">Ratio (coffee:water)</th>
                <th className="px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {BREW_GUIDE[product.roastLevel].map((row) => (
                <tr key={row.method} className="border-b border-border-on-brown last:border-0">
                  <td className="px-5 py-3 font-medium">{row.method}</td>
                  <td className="px-5 py-3 text-text-on-brown-muted">{row.grind}</td>
                  <td className="px-5 py-3 text-text-on-brown-muted">{row.ratio}</td>
                  <td className="px-5 py-3 text-text-on-brown-muted">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ProductReviews
        productId={product.id}
        slug={product.slug}
        rating={product.rating}
        ratingCount={product.ratingCount}
      />

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="more-roasts">
          <h2 id="more-roasts" className="mb-3 font-serif text-lg font-medium text-text-primary">
            More {roastLabel.toLowerCase()} roasts
          </h2>
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
