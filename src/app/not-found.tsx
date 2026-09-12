import Link from "next/link";
import { SorryDog } from "@/components/ui/sorry-dog";

const DOG_NAMES = ["Biscuit", "Rufus", "Nimbus", "Pepper", "Willow", "Gus"];

export default function NotFound() {
  const seed = 3;
  const name = DOG_NAMES[seed % DOG_NAMES.length];

  return (
    <div className="mx-auto flex max-w-[820px] flex-col items-center gap-8 px-4 py-14 text-center sm:flex-row sm:text-left">
      <div className="shrink-0">
        <SorryDog className="h-52 w-52" seed={seed} />
        <p className="mt-1 text-xs text-text-muted">
          {name}, one of the dogs of Amazon
        </p>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Sorry! We couldn&apos;t find that page.
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          But we have millions of other things to explore.
        </p>

        <form action="/s" className="mt-5 flex max-w-sm overflow-hidden rounded-md border border-border-strong">
          <input
            type="search"
            name="q"
            aria-label="Search"
            placeholder="Search for products"
            className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-chrome-search-btn px-4 text-sm font-medium text-accent-fg hover:bg-chrome-search-btn-hover"
          >
            Go
          </button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link
            href="/"
            className="rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Go to the Amazon.com home page
          </Link>
          <Link
            href="/s?deals=1"
            className="rounded-pill border border-border-strong px-6 py-2 text-sm hover:bg-subtle"
          >
            Today&apos;s Deals
          </Link>
        </div>
      </div>
    </div>
  );
}
