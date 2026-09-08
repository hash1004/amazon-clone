import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DEPARTMENTS } from "@/lib/departments";
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

function shortName(title: string) {
  return title.length > 24 ? title.slice(0, 22).trimEnd() + "…" : title;
}

export default async function Home() {
  const session = await auth();

  const byDept = await Promise.all(
    DEPARTMENTS.map(async (d) => ({
      dept: d,
      products: await db.product.findMany({
        where: { department: d.slug },
        orderBy: { ratingCount: "desc" },
        take: 20,
        select: CARD_SELECT,
      }),
    })),
  );

  const deals = await db.product.findMany({
    where: { listPriceCents: { not: null } },
    orderBy: { rating: "desc" },
    take: 18,
    select: CARD_SELECT,
  });

  const heroCopy = [
    "Upgrade your everyday",
    "Refresh every room",
    "New-season finds",
  ];
  const heroBg = ["#c7ddd8", "#e8e0d2", "#f0dcd6"];
  const heroSlides: HeroSlide[] = byDept.slice(0, 3).map(({ dept, products }, i) => ({
    headline: heroCopy[i] ?? `Shop ${dept.label}`,
    href: `/s?dept=${dept.slug}`,
    bg: heroBg[i] ?? "#e3e6e6",
    images: products.slice(0, 3).map((p) => p.images[0]).filter(Boolean),
  }));

  // Row of poster cards — one per department, top 4 distinct products as tiles.
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

  // Secondary row — "top rated" split cards.
  const splitCards: PosterCardData[] = byDept.map(({ dept, products }) => ({
    kind: "split",
    title: `Top rated in ${dept.label}`,
    footerHref: `/s?dept=${dept.slug}&sort=rating`,
    footerLabel: `Explore more`,
    lead: {
      image: products[0]?.images[0] ?? "",
      caption: products[0] ? shortName(products[0].title) : undefined,
      href: products[0] ? `/p/${products[0].slug}` : "/s",
    },
    tiles: products.slice(1, 4).map((p) => ({
      image: p.images[0],
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

        <BestSellerScroller
          title="Today's Deals"
          href="/s?deals=1"
          items={deals}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {splitCards.slice(0, 4).map((c, i) => (
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
