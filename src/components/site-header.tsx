import Link from "next/link";

const NAV_LINKS = [
  { label: "Today's Deals", href: "/s?deals=1" },
  { label: "Electronics", href: "/s?dept=electronics" },
  { label: "Home & Kitchen", href: "/s?dept=home-kitchen" },
  { label: "Books", href: "/s?dept=books" },
  { label: "Toys & Games", href: "/s?dept=toys-games" },
  { label: "Sports & Outdoors", href: "/s?dept=sports-outdoors" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      {/* ── Top row ─────────────────────────────────────────────── */}
      <div className="bg-chrome-nav text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-2 px-2 py-1.5">
          <Link
            href="/"
            className="flex shrink-0 items-end rounded-sm border border-transparent px-2 py-2 text-2xl font-bold leading-none hover:border-white"
          >
            amazon
            <span className="text-accent-buy">.clone</span>
          </Link>

          <Link
            href="/account/addresses"
            className="hidden shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1.5 hover:border-white sm:flex"
          >
            <span aria-hidden className="text-lg">📍</span>
            <span className="leading-tight">
              <span className="block text-xs text-neutral-300">Deliver to</span>
              <span className="block text-sm font-bold">United States</span>
            </span>
          </Link>

          {/* Search */}
          <form action="/s" className="flex min-w-0 flex-1 overflow-hidden rounded-md">
            <input
              type="search"
              name="q"
              aria-label="Search Amazon clone"
              placeholder="Search products"
              className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-text-primary outline-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-accent px-4 text-accent-fg hover:bg-accent-hover"
              aria-label="Search"
            >
              🔍
            </button>
          </form>

          <Link
            href="/account"
            className="hidden shrink-0 rounded-sm border border-transparent px-2 py-1.5 text-xs leading-tight hover:border-white md:block"
          >
            <span className="block">Hello, sign in</span>
            <span className="block text-sm font-bold">Account &amp; Lists</span>
          </Link>

          <Link
            href="/account/orders"
            className="hidden shrink-0 rounded-sm border border-transparent px-2 py-1.5 text-xs leading-tight hover:border-white md:block"
          >
            <span className="block">Returns</span>
            <span className="block text-sm font-bold">&amp; Orders</span>
          </Link>

          <Link
            href="/cart"
            className="flex shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1.5 hover:border-white"
          >
            <span aria-hidden className="text-2xl">🛒</span>
            <span className="text-sm font-bold">Cart</span>
          </Link>
        </div>
      </div>

      {/* ── Nav belt ────────────────────────────────────────────── */}
      <nav className="bg-chrome-belt text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-2 py-1 text-sm">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-sm border border-transparent px-2 py-1 hover:border-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
