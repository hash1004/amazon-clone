import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DEPARTMENTS } from "@/lib/departments";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel";
import {
  CategorySection,
  type CategoryProduct,
} from "@/components/home/category-section";
import { RecentlyViewedRow } from "@/components/recently-viewed-row";

const SELECT = {
  id: true,
  slug: true,
  title: true,
  brand: true,
  images: true,
  priceCents: true,
  listPriceCents: true,
  rating: true,
  ratingCount: true,
  department: true,
} as const;

type Row = CategoryProduct & { department: string };

function discountFrac(p: Row) {
  return p.listPriceCents ? (p.listPriceCents - p.priceCents) / p.listPriceCents : 0;
}

/** Up to 3 representative products within one department — meaningfully
 * discounted *and* well-reviewed first, topped up with top-sellers. The
 * hero links to the whole department, so it should read as a cluster of
 * things, not one item. */
function pickTop3(items: Row[]): Row[] {
  const discounted = [...items]
    .filter((p) => p.listPriceCents && discountFrac(p) > 0.08 && p.ratingCount >= 50)
    .sort((a, b) => discountFrac(b) - discountFrac(a));
  const bySalesLocal = [...items].sort((a, b) => b.ratingCount - a.ratingCount);

  const seen = new Set<string>();
  const out: Row[] = [];
  for (const p of [...discounted, ...bySalesLocal]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= 3) break;
  }
  return out;
}

const HERO_COPY: Record<
  string,
  { eyebrow: string; headline: string; tint: string }
> = {
  electronics: {
    eyebrow: "Electronics, considered",
    headline: "Fewer things,\nchosen well.",
    tint: "#eef1ea",
  },
  "home-kitchen": {
    eyebrow: "For slower mornings",
    headline: "Quiet mornings\nstart here.",
    tint: "#f3ece2",
  },
  fashion: {
    eyebrow: "Built to keep",
    headline: "Wear what\nactually lasts.",
    tint: "#f0e6e6",
  },
  beauty: {
    eyebrow: "Less, but better",
    headline: "Simple rituals,\nreal results.",
    tint: "#f4e9ef",
  },
  "sports-outdoors": {
    eyebrow: "Made to move",
    headline: "Built for how\nyou actually move.",
    tint: "#e7eee9",
  },
};

export default async function Home() {
  const session = await auth();

  const all = (await db.product.findMany({ select: SELECT })) as Row[];
  const bySales = [...all].sort((a, b) => b.ratingCount - a.ratingCount);

  // Up to 3 picks per department for the hero carousel.
  const picks = DEPARTMENTS.map((d) => ({
    dept: d,
    items: pickTop3(all.filter((p) => p.department === d.slug)),
  })).filter((x) => x.items.length > 0);

  const heroSlides: HeroSlide[] = picks.map(({ dept, items }) => {
    const copy = HERO_COPY[dept.slug];
    return {
      eyebrow: copy?.eyebrow ?? dept.label,
      headline: copy?.headline ?? dept.label,
      ctaLabel: "Shop now",
      href: `/s?dept=${dept.slug}`,
      tint: copy?.tint ?? "#f2f0ea",
      products: items.map((p) => ({ slug: p.slug, title: p.title, images: p.images })),
    };
  });

  const pickedIds = new Set(picks.flatMap(({ items }) => items.map((p) => p.id)));

  // Rest of each department, that department's own hero pick pushed to the
  // back so it isn't duplicated at the top of its own category grid.
  const byDept = DEPARTMENTS.map((d) => ({
    dept: d,
    items: bySales
      .filter((p) => p.department === d.slug)
      .sort((a, b) => Number(pickedIds.has(a.id)) - Number(pickedIds.has(b.id))),
  })).filter((r) => r.items.length > 0);

  return (
    <div className="pb-8">
      {heroSlides.length > 0 && <HeroCarousel slides={heroSlides} />}

      {byDept.map(({ dept, items }) => (
        <CategorySection
          key={dept.slug}
          title={dept.label}
          href={`/s?dept=${dept.slug}`}
          items={items}
        />
      ))}

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <RecentlyViewedRow title="Inspired by your browsing history" />
      </div>

      {!session?.user && (
        <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10">
          <div className="rounded-lg border border-border-default bg-surface p-8 text-center">
            <h2 className="text-xl font-semibold text-text-primary">
              See personalized recommendations
            </h2>
            <Link
              href="/login"
              className="mx-auto mt-4 block max-w-xs rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
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
        </div>
      )}
    </div>
  );
}
