import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { discountPct, formatPrice } from "@/lib/format";
import { estimateDelivery, formatDeliveryDate } from "@/lib/delivery";
import { PriceTag } from "@/components/ui/price-tag";
import { ProductGallery } from "@/components/product-gallery";
import { Accordion } from "@/components/ui/accordion";
import { AddToCart } from "@/components/add-to-cart";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductCard } from "@/components/product-card";
import { RatingSummary } from "@/components/product/rating-summary";
import { MobileBuyBar } from "@/components/product/mobile-buy-bar";
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

          <RatingSummary rating={product.rating} ratingCount={product.ratingCount} />
        </div>
      </div>

      <div className="mt-8">
        <Accordion title="Brew guide">
          <table className="w-full max-w-[70ch] text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="py-2 font-medium">Method</th>
                <th className="py-2 font-medium">Ratio (coffee:water)</th>
                <th className="py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {BREW_GUIDE[product.roastLevel].map((row) => (
                <tr key={row.method} className="border-b border-border-default last:border-0">
                  <td className="py-2 font-medium text-text-primary">{row.method}</td>
                  <td className="py-2 text-text-secondary">{row.ratio}</td>
                  <td className="py-2 text-text-secondary">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>

        {product.bullets.length > 0 && (
          <Accordion title="Highlights">
            <ul className="max-w-[70ch] list-disc space-y-1.5 pl-5 text-sm text-text-secondary">
              {product.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Accordion>
        )}

        <Accordion title="Product details">
          <table className="w-full max-w-[70ch] text-sm">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-border-default last:border-0">
                  <th className="w-40 py-2 text-left align-top font-medium text-text-primary">
                    {k}
                  </th>
                  <td className="py-2 text-text-secondary">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Accordion>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          {/* No border-t here — the last accordion above already ends in
              its own border-bottom; adding another divider + its own
              padding on top of that read as a doubled gap. */}
          <h2 className="mb-3 font-serif text-lg font-medium text-text-primary">
            More {roastLabel.toLowerCase()} roasts
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} withCart />
            ))}
          </div>
        </section>
      )}

      <div className="pb-16 lg:pb-0" />

      <MobileBuyBar product={cartLine} inStock={inStock} />
    </div>
  );
}
