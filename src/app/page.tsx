import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { DEPARTMENTS } from "@/lib/departments";
import { ProductScroller } from "@/components/product-scroller";

const SELECT = {
  slug: true,
  title: true,
  images: true,
  priceCents: true,
  listPriceCents: true,
} as const;

export default async function Home() {
  const [deals, topRated, categoryPreviews] = await Promise.all([
    db.product.findMany({
      where: { listPriceCents: { not: null } },
      orderBy: { ratingCount: "desc" },
      take: 12,
      select: SELECT,
    }),
    db.product.findMany({
      where: { rating: { gte: 4.5 } },
      orderBy: { ratingCount: "desc" },
      take: 12,
      select: SELECT,
    }),
    Promise.all(
      DEPARTMENTS.map(async (d) => ({
        dept: d,
        products: await db.product.findMany({
          where: { department: d.slug },
          orderBy: { ratingCount: "desc" },
          take: 4,
          select: { ...SELECT, id: true },
        }),
      })),
    ),
  ]);

  return (
    <div id="top" className="relative pb-8">
      <div className="h-40 w-full bg-gradient-to-b from-[#87b7c9] to-canvas sm:h-56" />

      <div className="mx-auto -mt-28 max-w-[1500px] space-y-4 px-3 sm:-mt-40">
        {/* Category tiles */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categoryPreviews.slice(0, 4).map(({ dept, products }) => (
            <Link
              key={dept.slug}
              href={`/s?dept=${dept.slug}`}
              className="group flex flex-col bg-surface p-4 shadow-sm"
            >
              <h2 className="mb-2 text-base font-bold">{dept.label}</h2>
              <div className="grid grid-cols-2 gap-1">
                {products.map((p) => (
                  <div key={p.id} className="relative aspect-square bg-white">
                    <Image
                      src={p.images[0]}
                      alt={p.title}
                      fill
                      sizes="120px"
                      className="object-contain p-1"
                    />
                  </div>
                ))}
              </div>
              <span className="link mt-2 text-sm">Shop {dept.label}</span>
            </Link>
          ))}
        </div>

        <ProductScroller
          title="Today's Deals"
          href="/s?deals=1"
          items={deals}
        />
        <ProductScroller
          title="Top rated across the store"
          href="/s?sort=rating"
          items={topRated}
        />

        {categoryPreviews.slice(4).map(({ dept, products }) => (
          <ProductScroller
            key={dept.slug}
            title={`Popular in ${dept.label}`}
            href={`/s?dept=${dept.slug}`}
            items={products}
          />
        ))}
      </div>
    </div>
  );
}
