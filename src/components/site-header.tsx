import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { CartBadge } from "@/components/cart-badge";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

const BELT_LINKS = [
  { label: "Today's Deals", href: "/s?deals=1" },
  ...DEPARTMENTS.map((d) => ({ label: d.label, href: `/s?dept=${d.slug}` })),
  { label: "Customer Service", href: "#" },
  { label: "Gift Cards", href: "#" },
  { label: "Sell", href: "#" },
];

const cell =
  "flex shrink-0 flex-col justify-center rounded-sm border border-transparent px-2 py-1 leading-tight hover:border-white";

export async function SiteHeader() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email;

  return (
    <header className="sticky top-0 z-40 text-white">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="bg-chrome-nav">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-stretch gap-x-1 gap-y-1 px-1.5 py-1.5 text-sm">
          <Link
            href="/"
            className="flex shrink-0 items-end rounded-sm border border-transparent px-2 py-2 hover:border-white"
          >
            <span className="text-xl font-bold leading-none sm:text-2xl">
              amazon
            </span>
            <span className="text-xl font-bold leading-none text-accent-buy sm:text-2xl">
              .clone
            </span>
          </Link>

          <div className={`${cell} hidden lg:flex`}>
            <span className="text-xs text-neutral-300">Deliver to</span>
            <span className="flex items-center gap-0.5 text-sm font-bold">
              <span aria-hidden>📍</span> United States
            </span>
          </div>

          {/* Search */}
          <form
            action="/s"
            className="order-last flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-md focus-within:ring-2 focus-within:ring-accent-buy sm:order-none sm:w-auto sm:flex-1"
          >
            <select
              name="dept"
              aria-label="Search in department"
              className="hidden shrink-0 border-r border-border-default bg-[#e6e6e6] px-2 text-xs text-text-primary outline-none sm:block"
            >
              <option value="">All</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              type="search"
              name="q"
              aria-label="Search Amazon clone"
              placeholder="Search Amazon clone"
              className="min-w-0 flex-1 bg-white px-3 text-sm text-text-primary outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex shrink-0 items-center bg-chrome-search-btn px-4 text-lg text-[#0f1111] hover:bg-chrome-search-btn-hover"
            >
              🔍
            </button>
          </form>

          <div className={`${cell} ml-auto hidden text-xs sm:flex`}>
            <span>🇺🇸</span>
            <span className="font-bold">EN</span>
          </div>

          {session?.user ? (
            <Link href="/account" className={`${cell} ml-auto text-xs sm:ml-0`}>
              <span>Hello, {firstName}</span>
              <span className="text-sm font-bold">Account &amp; Lists ▾</span>
            </Link>
          ) : (
            <Link href="/login" className={`${cell} ml-auto text-xs sm:ml-0`}>
              <span>Hello, sign in</span>
              <span className="text-sm font-bold">Account &amp; Lists ▾</span>
            </Link>
          )}

          <Link href="/account/orders" className={`${cell} hidden text-xs md:flex`}>
            <span>Returns</span>
            <span className="text-sm font-bold">&amp; Orders</span>
          </Link>

          {session?.user && (
            <div className={`${cell} hidden text-xs lg:flex`}>
              <span>&nbsp;</span>
              <SignOutButton />
            </div>
          )}

          <CartBadge />
        </div>
      </div>

      {/* ── Nav belt ────────────────────────────────────────────── */}
      <nav className="bg-chrome-belt">
        <div className="mx-auto flex max-w-[1500px] items-center gap-0.5 overflow-x-auto px-1.5 py-0.5 text-sm">
          <Link
            href="/s"
            className="flex shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1.5 font-bold hover:border-white"
          >
            <span aria-hidden>☰</span> All
          </Link>
          {BELT_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="shrink-0 rounded-sm border border-transparent px-2 py-1.5 hover:border-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
