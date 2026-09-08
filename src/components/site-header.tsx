import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { CartBadge } from "@/components/cart-badge";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

const NAV_LINKS = [
  { label: "Today's Deals", href: "/s?deals=1" },
  ...DEPARTMENTS.map((d) => ({
    label: d.label,
    href: `/s?dept=${d.slug}`,
  })),
];

export async function SiteHeader() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email;

  return (
    <header className="sticky top-0 z-40">
      {/* ── Top row ─────────────────────────────────────────────── */}
      <div className="bg-chrome-nav text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-2 gap-y-1 px-2 py-1.5">
          <Link
            href="/"
            className="flex shrink-0 items-end rounded-sm border border-transparent px-2 py-2 text-xl font-bold leading-none hover:border-white sm:text-2xl"
          >
            amazon
            <span className="text-accent-buy">.clone</span>
          </Link>

          <div className="hidden shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1.5 lg:flex">
            <span aria-hidden className="text-lg">📍</span>
            <span className="leading-tight">
              <span className="block text-xs text-neutral-300">Deliver to</span>
              <span className="block text-sm font-bold">United States</span>
            </span>
          </div>

          {/* Search — own row on mobile, inline from sm up */}
          <form
            action="/s"
            className="order-last flex w-full min-w-0 overflow-hidden rounded-md sm:order-none sm:w-auto sm:flex-1"
          >
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

          {session?.user ? (
            <div className="ml-auto shrink-0 rounded-sm border border-transparent px-2 py-1.5 text-xs leading-tight hover:border-white sm:ml-0">
              <Link href="/account" className="block">
                Hello, {firstName}
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-auto shrink-0 rounded-sm border border-transparent px-2 py-1.5 text-xs leading-tight hover:border-white sm:ml-0"
            >
              <span className="block">Hello, sign in</span>
              <span className="block text-sm font-bold">Account &amp; Lists</span>
            </Link>
          )}

          <Link
            href="/account/orders"
            className="hidden shrink-0 rounded-sm border border-transparent px-2 py-1.5 text-xs leading-tight hover:border-white md:block"
          >
            <span className="block">Returns</span>
            <span className="block text-sm font-bold">&amp; Orders</span>
          </Link>

          <CartBadge />
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
