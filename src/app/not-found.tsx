import Link from "next/link";
import { SorryMug } from "@/components/ui/sorry-mug";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[820px] flex-col items-center gap-8 px-4 py-14 text-center sm:flex-row sm:text-left">
      <div className="shrink-0">
        <SorryMug className="h-52 w-52" />
        <p className="mt-1 text-xs text-text-muted">This roast doesn&apos;t exist</p>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Sorry! We couldn&apos;t find that page.
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          But we&apos;ve got a dozen coffees worth exploring.
        </p>

        <form action="/s" className="mt-5 flex max-w-sm overflow-hidden rounded-md border border-border-strong">
          <input
            type="search"
            name="q"
            aria-label="Search"
            placeholder="Search coffee"
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
            Back to Still Coffee Co.
          </Link>
          <Link
            href="/s?deals=1"
            className="rounded-pill border border-border-strong px-6 py-2 text-sm hover:bg-subtle"
          >
            On Sale
          </Link>
        </div>
      </div>
    </div>
  );
}
