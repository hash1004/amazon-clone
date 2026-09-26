import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { discountPct, formatPrice } from "@/lib/format";
import { estimateDelivery, formatDeliveryDate } from "@/lib/delivery";
import { PriceTag } from "@/components/ui/price-tag";
import { ProductGallery } from "@/components/product-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductCard } from "@/components/product-card";
import { RatingSummary } from "@/components/product/rating-summary";
import { MobileBuyBar } from "@/components/product/mobile-buy-bar";
import { Reveal } from "@/components/ui/reveal";
import { RecordView } from "@/lib/recently-viewed";

const ROAST_LABEL = { LIGHT: "Light", MEDIUM: "Medium", DARK: "Dark" } as const;

const BREW_GUIDE: Record<string, { method: string; ratio: string; time: string }[]> = {
  LIGHT: [
    { method: "Pour-over", ratio: "1:16", time: "3:00–3:30" },
    { method: "Drip", ratio: "1:17", time: "5:00" },
    { method: "AeroPress", ratio: "1:14", time: "2:00" },
  ],
  MEDIUM: [
    { method: "Pour-over", ratio: "1:15", time: "2:45–3:15" },
    { method: "Drip", ratio: "1:16", time: "5:00" },
    { method: "French press", ratio: "1:15", time: "4:00" },
  ],
  DARK: [
    { method: "Espresso", ratio: "1:2", time: "0:25–0:30" },
    { method: "French press", ratio: "1:14", time: "4:00" },
    { method: "Moka pot", ratio: "1:10", time: "4:00–5:00" },
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

  const pct = discountPct(product.priceCents, product.listPriceCents);
  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 10;
  const eta = estimateDelivery("standard");
  const roastLabel = ROAST_LABEL[product.roastLevel];
  const sku = `${roastLabel.slice(0, 2).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;

  const related = await db.product.findMany({
    where: { roastLevel: product.roastLevel, id: { not: product.id } },
    orderBy: { ratingCount: "desc" },
    take: 10,
  });

  const specs: [string, string][] = [
    ["SKU", sku],
    ["Origin", product.origin],
    ["Process", product.process],
    ["Roast level", roastLabel],
    ["Net weight", `${product.weightGrams}g whole bean`],
  ];

  const cartLine = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: product.images[0] ?? "",
    priceCents: product.priceCents,
  };

  return (
    <div className="w-full bg-canvas px-4 py-6 sm:px-8 lg:px-12">
      <RecordView entry={cartLine} />

      <nav className="mb-4 text-xs text-text-secondary">
        <Link href={`/s?roast=${product.roastLevel.toLowerCase()}`} className="link">
          {roastLabel} Roasts
        </Link>
        {" › "}
        <Link href={`/s?origin=${encodeURIComponent(product.origin)}`} className="link">
          {product.origin}
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
          <p className="mt-2 text-sm text-text-secondary">
            {product.origin} · {product.process} process · {roastLabel} roast
          </p>

          <ul className="mt-3 flex flex-wrap gap-2">
            {product.tastingNotes.map((note) => (
              <li
                key={note}
                className="rounded-pill border border-border-default bg-surface px-3 py-1 text-xs text-text-secondary"
              >
                {note}
              </li>
            ))}
          </ul>

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
            <span className="text-sm text-text-secondary">/ {product.weightGrams}g bag</span>
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

          <h2 className="mb-2 mt-6 font-serif text-lg font-medium text-text-primary">
            About this coffee
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            {product.description}
          </p>
          {product.bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-text-secondary">
              {product.bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-text-accent">
                    ·
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          <RatingSummary rating={product.rating} ratingCount={product.ratingCount} />
        </div>
      </div>

      <Reveal className="mt-10">
        <h2 className="mb-4 font-serif text-xl font-medium text-text-primary">Brew guide</h2>
        <div className="grain bg-chrome-nav overflow-hidden rounded-xl text-text-on-brown">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-on-brown text-left text-xs uppercase tracking-wide text-text-on-brown-muted">
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Ratio (coffee:water)</th>
                <th className="px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {BREW_GUIDE[product.roastLevel].map((row) => (
                <tr key={row.method} className="border-b border-border-on-brown last:border-0">
                  <td className="px-5 py-3 font-medium">{row.method}</td>
                  <td className="px-5 py-3 text-text-on-brown-muted">{row.ratio}</td>
                  <td className="px-5 py-3 text-text-on-brown-muted">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal className="mt-10 max-w-[70ch]">
        <h2 className="mb-3 font-serif text-lg font-medium text-text-primary">
          Product details
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {specs.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-text-secondary">{k}</dt>
              <dd className="text-text-primary">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {related.length > 0 && (
        <Reveal className="mt-12">
          <h2 className="mb-3 font-serif text-lg font-medium text-text-primary">
            More {roastLabel.toLowerCase()} roasts
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} withCart />
            ))}
          </div>
        </Reveal>
      )}

      <div className="pb-16 lg:pb-0" />

      <MobileBuyBar product={cartLine} inStock={inStock} />
    </div>
  );
}
