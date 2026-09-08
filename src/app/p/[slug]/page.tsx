import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { discountPct, formatPrice, priceParts } from "@/lib/format";
import { DEPARTMENT_BY_SLUG } from "@/lib/departments";
import { RatingStars } from "@/components/rating-stars";
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
  const { whole, frac } = priceParts(product.priceCents);
  const pct = discountPct(product.priceCents, product.listPriceCents);
  const inStock = product.stock > 0;

  const related = await db.product.findMany({
    where: { department: product.department, id: { not: product.id } },
    orderBy: { ratingCount: "desc" },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4">
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
        <span>{product.brand}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]">
        {/* Gallery */}
        <div className="bg-surface p-4 shadow-sm">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h1 className="text-2xl font-medium leading-tight">{product.title}</h1>
          <p className="mt-1 text-sm text-text-accent">by {product.brand}</p>
          <div className="mt-1 flex items-center gap-2">
            <RatingStars rating={product.rating} count={product.ratingCount} />
            <span className="text-xs text-text-secondary">
              {product.rating.toFixed(1)} out of 5
            </span>
          </div>

          <hr className="my-3 border-border-default" />

          <div className="flex items-baseline gap-2">
            {pct > 0 && (
              <span className="text-lg font-bold text-text-deal">-{pct}%</span>
            )}
            <span>
              <span className="align-super text-sm">$</span>
              <span className="text-3xl font-medium">{whole}</span>
              <span className="align-super text-sm">{frac}</span>
            </span>
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

          <h2 className="mb-1 text-sm font-bold">About this item</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-text-primary">
            {product.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>

          <h2 className="mb-1 mt-4 text-sm font-bold">Product description</h2>
          <p className="text-sm text-text-secondary">{product.description}</p>
        </div>

        {/* Buy box */}
        <aside className="h-fit rounded-lg border border-border-default bg-surface p-4 shadow-sm">
          <p className="text-xl">
            <span className="align-super text-xs">$</span>
            <span className="font-medium">{whole}</span>
            <span className="align-super text-xs">{frac}</span>
          </p>
          <p className="mt-1 text-sm">
            {inStock ? (
              <span className="font-medium text-success">In Stock</span>
            ) : (
              <span className="font-medium text-text-deal">Out of stock</span>
            )}
          </p>
          <p className="mb-3 text-xs text-text-secondary">
            Ships from and sold by Amazon clone.
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
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">
            More in {dept?.label ?? "this category"}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
