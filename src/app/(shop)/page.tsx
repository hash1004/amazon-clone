import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DEPARTMENTS, DEPARTMENT_BY_SLUG } from "@/lib/departments";
import { Spotlight, type SpotlightProduct } from "@/components/home/spotlight";
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

export default async function Home() {
  const session = await auth();

  const all = (await db.product.findMany({ select: SELECT })) as Row[];

  const bySales = [...all].sort((a, b) => b.ratingCount - a.ratingCount);
  const byDiscount = [...all]
    .filter((p) => p.listPriceCents)
    .sort((a, b) => discountFrac(b) - discountFrac(a));

  // One considered pick for the spotlight: meaningfully discounted *and*
  // well-reviewed, not just whatever has the deepest markdown.
  const spotlightSource =
    byDiscount.find((p) => p.ratingCount >= 400 && discountFrac(p) > 0.1) ??
    byDiscount[0] ??
    bySales[0];
  const spotlightDept = DEPARTMENT_BY_SLUG[spotlightSource.department];
  const spotlight: SpotlightProduct = spotlightSource;

  // Rest of each department, spotlight pick pushed to the back so it isn't
  // duplicated in its own category grid.
  const byDept = DEPARTMENTS.map((d) => ({
    dept: d,
    items: bySales
      .filter((p) => p.department === d.slug)
      .sort((a, b) =>
        a.id === spotlightSource.id ? 1 : b.id === spotlightSource.id ? -1 : 0,
      ),
  })).filter((r) => r.items.length > 0);

  return (
    <div className="pb-8">
      <Spotlight
        deptLabel={spotlightDept?.label ?? "This week"}
        deptHref={`/s?dept=${spotlightSource.department}`}
        product={spotlight}
      />

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
