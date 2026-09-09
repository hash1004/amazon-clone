import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DEPARTMENTS } from "@/lib/departments";
import { HomeHero, type HeroSlide } from "@/components/home/home-hero";
import { PosterCard, type PosterCardData } from "@/components/home/poster-card";
import { ProductRail } from "@/components/home/product-rail";
import { RecentlyViewedRow } from "@/components/recently-viewed-row";

const SELECT = {
  id: true,
  slug: true,
  title: true,
  images: true,
  priceCents: true,
  listPriceCents: true,
  rating: true,
  ratingCount: true,
} as const;

function shortName(title: string) {
  return title.length > 24 ? title.slice(0, 22).trimEnd() + "…" : title;
}

export default async function Home() {
  const session = await auth();

  const [byDept, deals, topRated, newArrivals] = await Promise.all([
    Promise.all(
      DEPARTMENTS.map(async (d) => ({
        dept: d,
        products: await db.product.findMany({
          where: { department: d.slug },
          orderBy: { ratingCount: "desc" },
          take: 16,
          select: SELECT,
        }),
      })),
    ),
    db.product.findMany({
      where: { listPriceCents: { not: null } },
      orderBy: { ratingCount: "desc" },
      take: 18,
      select: SELECT,
    }),
    db.product.findMany({
      where: { rating: { gte: 4.5 } },
      orderBy: { ratingCount: "desc" },
      take: 18,
      select: SELECT,
    }),
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 18,
      select: SELECT,
    }),
  ]);

  // biggest discounts first for the deals rail
  deals.sort(
    (a, b) =>
      (b.listPriceCents! - b.priceCents) / b.listPriceCents! -
      (a.listPriceCents! - a.priceCents) / a.listPriceCents!,
  );

  const bestSellers = byDept
    .flatMap((d) => d.products.slice(0, 4))
    .sort((a, b) => b.ratingCount - a.ratingCount)
    .slice(0, 16);

  const heroCopy = ["Upgrade your everyday", "Refresh every room", "New-season finds"];
  const heroBg = ["#c7ddd8", "#e8e0d2", "#f0dcd6"];
  const heroSlides: HeroSlide[] = byDept.slice(0, 3).map(({ dept, products }, i) => ({
    headline: heroCopy[i] ?? `Shop ${dept.label}`,
    href: `/s?dept=${dept.slug}`,
    bg: heroBg[i] ?? "#e3e6e6",
    images: products.slice(0, 3).map((p) => p.images[0]).filter(Boolean),
  }));

  const deptCards: PosterCardData[] = byDept.map(({ dept, products }) => ({
    kind: "quad",
    title: `Shop ${dept.label}`,
    footerHref: `/s?dept=${dept.slug}`,
    footerLabel: `See all ${dept.label}`,
    tiles: products.slice(0, 4).map((p) => ({
      image: p.images[0],
      caption: shortName(p.title),
      href: `/p/${p.slug}`,
    })),
  }));

  return (
    <div className="pb-8">
      <HomeHero slides={heroSlides} />

      <div className="mx-auto max-w-[1500px] space-y-3 px-3 pt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {deptCards.slice(0, 4).map((c, i) => (
            <PosterCard key={i} data={c} />
          ))}
        </div>

        <ProductRail
          theme="deal"
          title="Today's Deals — up to 60% off"
          href="/s?deals=1&sort=price-asc"
          items={deals}
        />

        <ProductRail
          theme="bestseller"
          title="Best Sellers"
          href="/s?sort=rating"
          items={bestSellers}
        />

        <ProductRail
          title="New arrivals"
          href="/s?sort=newest"
          items={newArrivals}
        />

        <ProductRail
          title="Top rated — 4 stars & above"
          href="/s?rating=4"
          items={topRated}
        />

        {byDept.slice(0, 3).map(({ dept, products }) => (
          <ProductRail
            key={dept.slug}
            title={`More to explore in ${dept.label}`}
            href={`/s?dept=${dept.slug}`}
            items={products}
          />
        ))}

        <RecentlyViewedRow title="Inspired by your browsing history" />

        {!session?.user && (
          <div className="bg-surface p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">See personalized recommendations</h2>
            <Link
              href="/login"
              className="mx-auto mt-3 block max-w-xs rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
            >
              Sign in
            </Link>
            <p className="mt-2 text-xs text-text-secondary">
              New customer?{" "}
              <Link href="/signup" className="link">
                Start here.
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
