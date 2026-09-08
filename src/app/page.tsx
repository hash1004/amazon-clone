import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DEPARTMENTS } from "@/lib/departments";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { HomeHero, type HeroSlide } from "@/components/home/home-hero";
import { PosterCard, type PosterCardData } from "@/components/home/poster-card";
import { BestSellerScroller } from "@/components/home/best-seller-scroller";

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  images: true,
  priceCents: true,
  listPriceCents: true,
} as const;

export default async function Home() {
  const session = await auth();

  const byDept = await Promise.all(
    DEPARTMENTS.map(async (d) => ({
      dept: d,
      products: await db.product.findMany({
        where: { department: d.slug },
        orderBy: { ratingCount: "desc" },
        take: 18,
        select: CARD_SELECT,
      }),
    })),
  );

  const deals = await db.product.findMany({
    where: { listPriceCents: { not: null } },
    orderBy: { ratingCount: "desc" },
    take: 16,
    select: CARD_SELECT,
  });

  const heroSlides: HeroSlide[] = byDept.slice(0, 3).map(({ dept, products }, i) => ({
    headline:
      ["Upgrade your tech", "Refresh every room", "New-season finds"][i] ??
      `Shop ${dept.label}`,
    href: `/s?dept=${dept.slug}`,
    bg: ["#a8d0d6", "#e5ded1", "#f2d9d0"][i] ?? "#e3e6e6",
    images: products.slice(0, 3).map((p) => p.images[0]).filter(Boolean),
  }));

  // Poster row 1 — a "shop by price" quad card per department
  const priceCards: PosterCardData[] = byDept.slice(0, 4).map(({ dept, products }) => ({
    kind: "quad",
    title: `${dept.label} for every budget`,
    footerHref: `/s?dept=${dept.slug}`,
    footerLabel: `Shop all ${dept.label}`,
    tiles: PRICE_BUCKETS.map((b, i) => ({
      image: products[i]?.images[0] ?? products[0]?.images[0] ?? "",
      caption: b.label,
      href: `/s?dept=${dept.slug}${b.min ? `&min=${b.min}` : ""}${
        b.max ? `&max=${b.max}` : ""
      }`,
    })),
  }));

  // Poster row 2 — a "top categories" split card + single spotlights
  const mixCards: PosterCardData[] = byDept.map(({ dept, products }, idx) => {
    if (idx % 2 === 0) {
      return {
        kind: "split",
        title: `Top rated in ${dept.label}`,
        footerHref: `/s?dept=${dept.slug}&sort=rating`,
        footerLabel: `Explore ${dept.label}`,
        lead: {
          image: products[0]?.images[0] ?? "",
          caption: products[0]?.title,
          href: products[0] ? `/p/${products[0].slug}` : "/s",
        },
        tiles: products.slice(1, 4).map((p) => ({
          image: p.images[0],
          href: `/p/${p.slug}`,
        })),
      };
    }
    return {
      kind: "single",
      title: `Deals in ${dept.label}`,
      footerHref: `/s?dept=${dept.slug}&deals=1`,
      footerLabel: "See all deals",
      tile: {
        image: products[0]?.images[0] ?? "",
        caption: products[0]?.title,
        href: `/s?dept=${dept.slug}&deals=1`,
      },
    };
  });

  return (
    <div className="relative pb-8">
      <HomeHero slides={heroSlides} />

      <div className="mx-auto -mt-24 max-w-[1500px] space-y-4 px-3 sm:-mt-32">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {priceCards.map((c, i) => (
            <PosterCard key={i} data={c} />
          ))}
        </div>

        <BestSellerScroller
          title="Today's Deals"
          href="/s?deals=1"
          items={deals}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mixCards.slice(0, 4).map((c, i) => (
            <PosterCard key={i} data={c} />
          ))}
        </div>

        {byDept.map(({ dept, products }) => (
          <BestSellerScroller
            key={dept.slug}
            title={`Best Sellers in ${dept.label}`}
            href={`/s?dept=${dept.slug}`}
            items={products}
          />
        ))}

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
