import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Spotlight } from "@/components/home/spotlight";
import { CategorySection } from "@/components/home/category-section";
import { RecentlyViewedRow } from "@/components/recently-viewed-row";
import { Reveal } from "@/components/ui/reveal";

const SELECT = {
  id: true,
  slug: true,
  title: true,
  origin: true,
  process: true,
  roastLevel: true,
  tastingNotes: true,
  images: true,
  priceCents: true,
  listPriceCents: true,
  rating: true,
  ratingCount: true,
  featured: true,
} as const;

const ROAST_SECTIONS = [
  { level: "LIGHT" as const, title: "Light roasts", blurb: "Bright, floral, fruit-forward." },
  { level: "MEDIUM" as const, title: "Medium roasts", blurb: "Balanced — chocolate, nut, caramel." },
  { level: "DARK" as const, title: "Dark roasts", blurb: "Bold, low-acid, built for espresso." },
];

export default async function Home() {
  const session = await auth();
  const all = await db.product.findMany({ select: SELECT, orderBy: { ratingCount: "desc" } });

  const spotlightProduct = all.find((p) => p.featured) ?? all[0];

  return (
    <div className="pb-8">
      {spotlightProduct && (
        <Spotlight
          product={{
            slug: spotlightProduct.slug,
            title: spotlightProduct.title,
            origin: spotlightProduct.origin,
            process: spotlightProduct.process,
            tastingNotes: spotlightProduct.tastingNotes,
            images: spotlightProduct.images,
            priceCents: spotlightProduct.priceCents,
          }}
        />
      )}

      <Reveal className="mx-auto max-w-[700px] px-6 py-14 text-center sm:py-20">
        <p className="font-serif text-2xl italic leading-snug text-text-primary sm:text-3xl">
          One coffee, done well — small-batch roasted, and shipped within 48
          hours so it never sits on a shelf.
        </p>
      </Reveal>

      {ROAST_SECTIONS.map(({ level, title, blurb }, i) => {
        const items = all.filter((p) => p.roastLevel === level);
        if (items.length === 0) return null;
        return (
          <Reveal key={level} delayMs={i * 80}>
            <CategorySection
              title={title}
              blurb={blurb}
              href={`/s?roast=${level.toLowerCase()}`}
              items={items}
            />
          </Reveal>
        );
      })}

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <RecentlyViewedRow title="Recently viewed" />
      </div>

      {!session?.user && (
        <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10">
          <div className="rounded-lg border border-border-default bg-surface p-8 text-center">
            <h2 className="text-xl font-semibold text-text-primary">
              Save your addresses and order history
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
