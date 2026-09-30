import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BREW_GUIDES, brewGuide } from "@/lib/brew-guides";
import { grindLabel } from "@/lib/variants";
import { ProductCard } from "@/components/product-card";

const ROAST_LABEL = { LIGHT: "Light roasts", MEDIUM: "Medium roasts", DARK: "Dark roasts" } as const;

export function generateStaticParams() {
  return BREW_GUIDES.map((g) => ({ method: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ method: string }>;
}): Promise<Metadata> {
  const { method } = await params;
  const guide = brewGuide(method);
  return { title: guide ? `${guide.name} guide` : "Brew guide not found" };
}

export default async function BrewGuidePage({ params }: { params: Promise<{ method: string }> }) {
  const { method } = await params;
  const guide = brewGuide(method);
  if (!guide) notFound();

  const suggestions = await db.product.findMany({
    where: { roastLevel: guide.suits[0] },
    orderBy: { ratingCount: "desc" },
    take: 4,
  });

  const facts: [string, string][] = [
    ["Coffee", guide.dose],
    ["Water", guide.water],
    ["Ratio", guide.ratio],
    ["Grind", guide.grindDescription],
    ["Water temperature", guide.temperature],
    ["Brew time", guide.time],
  ];

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-text-secondary">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/brew" className="link">
              Brew guides
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page">{guide.name}</li>
        </ol>
      </nav>

      <h1 className="font-serif text-3xl font-medium text-text-primary">{guide.name}</h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-text-secondary">{guide.summary}</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-medium text-text-primary">Method</h2>
          <ol className="mt-3 space-y-3">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-text-primary">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-text-accent"
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {Object.keys(guide.byRoast).length > 0 && (
            <>
              <h2 className="mt-8 font-serif text-xl font-medium text-text-primary">
                Adjusting for the roast
              </h2>
              <dl className="mt-3 space-y-3 text-sm">
                {(Object.entries(guide.byRoast) as [keyof typeof ROAST_LABEL, string][]).map(
                  ([roast, tip]) => (
                    <div key={roast}>
                      <dt className="font-medium text-text-primary">{ROAST_LABEL[roast]}</dt>
                      <dd className="mt-0.5 leading-relaxed text-text-secondary">{tip}</dd>
                    </div>
                  ),
                )}
              </dl>
            </>
          )}

          <h2 className="mt-8 font-serif text-xl font-medium text-text-primary">You&apos;ll need</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text-primary">
            {guide.equipment.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>

        <aside className="h-fit border border-border-default bg-surface p-5">
          <h2 className="font-serif text-lg font-medium text-text-primary">Recipe</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-text-secondary">{k}</dt>
                <dd className="text-text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-border-default pt-3 text-xs text-text-secondary">
            Buying ground? Choose <span className="font-medium text-text-primary">{grindLabel(guide.grind)}</span> on
            the coffee&apos;s page.
          </p>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-12" aria-labelledby="try-with">
          <h2 id="try-with" className="mb-3 font-serif text-lg font-medium text-text-primary">
            Good with {guide.name.toLowerCase()}: {ROAST_LABEL[guide.suits[0]].toLowerCase()}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
