import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DEPARTMENTS } from "@/lib/departments";
import { HomeHero, type HeroSlide } from "@/components/home/home-hero";
import { PosterCard, type PosterCardData } from "@/components/home/poster-card";
import { ProductRail, type RailProduct } from "@/components/home/product-rail";
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
  department: true,
  createdAt: true,
} as const;

type Row = RailProduct & { department: string; createdAt: Date };

function shortName(title: string) {
  return title.length > 24 ? title.slice(0, 22).trimEnd() + "…" : title;
}

function discountFrac(p: Row) {
  return p.listPriceCents ? (p.listPriceCents - p.priceCents) / p.listPriceCents : 0;
}

export default async function Home() {
  const session = await auth();

  // One pool, partitioned into non-overlapping sections below.
  const all = (await db.product.findMany({ select: SELECT })) as Row[];

  const used = new Set<string>();
  const take = (sorted: Row[], n: number) => {
    const out: Row[] = [];
    for (const p of sorted) {
      if (out.length >= n) break;
      if (!used.has(p.id)) {
        out.push(p);
        used.add(p.id);
      }
    }
    return out;
  };

  const bySales = [...all].sort((a, b) => b.ratingCount - a.ratingCount);
  const byRating = [...all].sort(
    (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
  );
  const byNewest = [...all].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const byDiscount = all
    .filter((p) => p.listPriceCents && discountFrac(p) > 0.05)
    .sort((a, b) => discountFrac(b) - discountFrac(a));

  // Category poster tiles claim their products first, then each rail.
  const topByDept = DEPARTMENTS.map((d) => ({
    dept: d,
    products: take(
      bySales.filter((p) => p.department === d.slug),
      4,
    ),
  }));

  // Priority order — each section claims its products first.
  const dealItems = take(byDiscount, 16); // active promotions, biggest % off
  const bestSellerItems = take(bySales, 16); // highest "sales" (rating count)
  const newItems = take(byNewest, 16); // most recently added
  const topRatedItems = take(
    byRating.filter((p) => p.ratingCount >= 40),
    16,
  ); // highest rating (with enough reviews to be meaningful)

  const deptRails = DEPARTMENTS.map((d) => ({
    dept: d,
    items: take(
      bySales.filter((p) => p.department === d.slug),
      16,
    ),
  })).filter((r) => r.items.length >= 4);

  const heroCopy = ["Upgrade your everyday", "Refresh every room", "New-season finds"];
  const heroBg = ["#c7ddd8", "#e8e0d2", "#f0dcd6"];
  const heroSlides: HeroSlide[] = topByDept.slice(0, 3).map(({ dept, products }, i) => ({
    headline: heroCopy[i] ?? `Shop ${dept.label}`,
    href: `/s?dept=${dept.slug}`,
    bg: heroBg[i] ?? "#e3e6e6",
    images: products.slice(0, 3).map((p) => p.images[0]).filter(Boolean),
  }));

  const deptCards: PosterCardData[] = topByDept.map(({ dept, products }) => ({
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
          title="Today's Deals"
          href="/s?deals=1&sort=price-asc"
          items={dealItems}
        />

        <ProductRail
          theme="bestseller"
          title="Best Sellers"
          href="/s?sort=rating"
          items={bestSellerItems}
        />

        <ProductRail
          title="New Arrivals"
          href="/s?sort=newest"
          items={newItems}
        />

        <ProductRail
          title="Top Rated"
          href="/s?rating=4&sort=rating"
          items={topRatedItems}
        />

        {deptRails.map(({ dept, items }) => (
          <ProductRail
            key={dept.slug}
            title={`More to explore in ${dept.label}`}
            href={`/s?dept=${dept.slug}`}
            items={items}
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
