import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { CartBadge } from "@/components/cart-badge";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { AmazonLogo } from "@/components/ui/amazon-logo";
import { SearchIcon, PinIcon, ChevronDownIcon } from "@/components/ui/icons";

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
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 text-sm">
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-sm border border-transparent px-1.5 py-2 hover:border-white"
          >
            <AmazonLogo className="h-7 w-[92px]" />
          </Link>

          <div className={`${cell} hidden lg:flex`}>
            <span className="pl-3 text-xs text-neutral-300">Deliver to</span>
            <span className="flex items-center gap-0.5 text-sm font-bold">
              <PinIcon className="h-3.5 w-3.5" /> United States
            </span>
          </div>

          {/* Search */}
          <form
            action="/s"
            className="order-last flex h-10 w-full min-w-0 items-stretch overflow-hidden rounded-md ring-accent-buy focus-within:ring-3 sm:order-none sm:w-auto sm:flex-1"
          >
            <select
              name="dept"
              aria-label="Search in department"
              className="hidden shrink-0 border-r border-[#cdcdcd] bg-[#e6e6e6] px-2 text-xs text-text-primary outline-none hover:bg-[#dcdcdc] sm:block"
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
              aria-label="Search Amazon"
              placeholder="Search Amazon"
              className="min-w-0 flex-1 bg-white px-3 text-sm text-text-primary outline-none"
            />
            <button
              type="submit"
              aria-label="Go"
              className="flex shrink-0 items-center bg-chrome-search-btn px-3.5 text-[#0f1111] hover:bg-chrome-search-btn-hover"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </form>

          <div className={`${cell} ml-auto hidden text-xs sm:flex`}>
            <span>&nbsp;</span>
            <span className="flex items-center gap-0.5 font-bold">
              EN <ChevronDownIcon className="h-3 w-3 text-neutral-400" />
            </span>
          </div>

          {session?.user ? (
            <Link href="/account" className={`${cell} ml-auto text-xs sm:ml-0`}>
              <span>Hello, {firstName}</span>
              <span className="flex items-center gap-0.5 text-sm font-bold">
                Account &amp; Lists
                <ChevronDownIcon className="h-3 w-3 text-neutral-400" />
              </span>
            </Link>
          ) : (
            <Link href="/login" className={`${cell} ml-auto text-xs sm:ml-0`}>
              <span>Hello, sign in</span>
              <span className="flex items-center gap-0.5 text-sm font-bold">
                Account &amp; Lists
                <ChevronDownIcon className="h-3 w-3 text-neutral-400" />
              </span>
            </Link>
          )}

          <Link href="/account/orders" className={`${cell} hidden text-xs md:flex`}>
            <span>Returns</span>
            <span className="text-sm font-bold">&amp; Orders</span>
          </Link>

          <Link href="/wishlist" className={`${cell} hidden text-xs lg:flex`}>
            <span>Your</span>
            <span className="text-sm font-bold">List</span>
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
            className="flex shrink-0 items-center gap-1.5 rounded-sm border border-transparent px-2 py-1.5 font-bold hover:border-white"
          >
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-[2px] w-3.5 bg-white" />
              <span className="block h-[2px] w-3.5 bg-white" />
              <span className="block h-[2px] w-3.5 bg-white" />
            </span>
            All
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
