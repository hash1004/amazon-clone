import { db } from "@/lib/db";
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
  stock: true,
} as const;

const ROAST_SECTIONS = [
  {
    level: "LIGHT" as const,
    title: "Light roasts",
    blurb: "Bright, floral, fruit-forward.",
    prompt: "You like it bright and fruity, and drink it black",
    brew: "pour-over, drip or AeroPress",
  },
  {
    level: "MEDIUM" as const,
    title: "Medium roasts",
    blurb: "Balanced — chocolate, nut, caramel.",
    prompt: "You want something balanced for every day, with or without milk",
    brew: "drip, pour-over or French press",
  },
  {
    level: "DARK" as const,
    title: "Dark roasts",
    blurb: "Bold, low-acid, built for espresso.",
    prompt: "You want it bold and low in acidity, as espresso or with milk",
    brew: "espresso, moka pot or French press",
  },
];

const PROMISES = [
  { title: "Roasted to order", body: "Shipped within 48 hours of roasting" },
  { title: "Free standard delivery", body: "Anywhere in the US, 4–6 business days" },
  { title: "Your grind", body: "Whole bean, or ground for your brewer" },
];

export default async function Home() {
  const all = await db.product.findMany({ select: SELECT, orderBy: { ratingCount: "desc" } });

  const featured = all.filter((p) => p.featured);
  const slides = (featured.length > 0 ? featured : all.slice(0, 4)).map((p) => ({
    slug: p.slug,
    title: p.title,
    origin: p.origin,
    process: p.process,
    tastingNotes: p.tastingNotes,
    images: p.images,
  }));

  return (
    <div className="pb-8">
      <Spotlight products={slides} />

      <div className="border-b border-border-default bg-surface">
        <ul className="mx-auto grid max-w-[1400px] gap-4 px-6 py-5 sm:grid-cols-3 sm:px-10">
          {PROMISES.map((p) => (
            <li key={p.title} className="text-center">
              <p className="text-sm font-semibold text-text-primary">{p.title}</p>
              <p className="text-xs text-text-secondary">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <Reveal className="mx-auto max-w-[700px] px-6 pb-8 pt-14 text-center sm:pt-20">
        <p className="font-serif text-2xl leading-snug text-text-primary sm:text-3xl">
          Small-batch coffee, roasted to order and shipped within 48 hours, so
          it never sits on a shelf.
        </p>
      </Reveal>

      <section aria-labelledby="start-here" className="mx-auto max-w-[1400px] px-6 pb-6 sm:px-10">
        <h2 id="start-here" className="text-center text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Not sure where to start?
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {ROAST_SECTIONS.map(({ level, title, prompt, brew }) => (
            <li key={level}>
              <a
                href={`#roast-${level.toLowerCase()}`}
                className="flex h-full flex-col border border-border-default bg-surface p-5 transition-colors hover:border-border-accent"
              >
                <span className="text-sm text-text-secondary">{prompt}</span>
                <span className="mt-3 font-serif text-lg font-medium text-text-primary">
                  Try our {title.toLowerCase()} →
                </span>
                <span className="mt-1 text-xs text-text-secondary">Best for {brew}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <RecentlyViewedRow title="Recently viewed" />
      </div>

      {ROAST_SECTIONS.map(({ level, title, blurb }, i) => {
        const items = all.filter((p) => p.roastLevel === level);
        if (items.length === 0) return null;
        return (
          <div key={level} id={`roast-${level.toLowerCase()}`} className="scroll-mt-16">
            <Reveal delayMs={i * 80}>
              <CategorySection
                title={title}
                blurb={blurb}
                href={`/s?roast=${level.toLowerCase()}`}
                items={items}
              />
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}
