import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";

const CATEGORY_CARDS = DEPARTMENTS.slice(0, 4).map((d) => ({
  title: d.label,
  href: `/s?dept=${d.slug}`,
  emoji: d.emoji,
}));

export default function Home() {
  return (
    <div id="top" className="relative">
      {/* Hero */}
      <div className="h-56 w-full bg-gradient-to-b from-[#a7c8d6] to-canvas sm:h-72" />

      {/* Category cards overlapping the hero */}
      <div className="mx-auto -mt-40 max-w-[1500px] px-4 sm:-mt-48">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col bg-surface p-5 shadow-sm"
            >
              <h2 className="mb-3 text-lg font-bold">{c.title}</h2>
              <div className="mb-3 flex h-40 items-center justify-center bg-subtle text-6xl">
                <span aria-hidden>{c.emoji}</span>
              </div>
              <span className="link text-sm">Shop now</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-bold">Welcome to the Amazon clone</h2>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            A working storefront slice: browse and search a catalog, open a
            product, build a cart as a guest, sign in, and check out through a
            mock payment to an order confirmation. Skeleton is live — catalog and
            checkout land next.
          </p>
          <Link
            href="/s"
            className="mt-4 inline-block rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Browse all products
          </Link>
        </div>
      </div>
    </div>
  );
}
