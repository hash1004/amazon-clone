import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { CartBadge } from "@/components/cart-badge";
import { auth } from "@/auth";
import { AmazonLogo } from "@/components/ui/amazon-logo";
import { PinIcon, ChevronDownIcon, UsFlagIcon } from "@/components/ui/icons";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchBox } from "@/components/search/search-box";
import { AccountMenu } from "@/components/account-menu";

const BELT_LINKS = [
  { label: "Today's Deals", href: "/s?deals=1" },
  ...DEPARTMENTS.map((d) => ({ label: d.label, href: `/s?dept=${d.slug}` })),
  { label: "New Arrivals", href: "/s?sort=newest" },
  { label: "Best Sellers", href: "/s?sort=rating" },
];

const cell =
  "flex shrink-0 flex-col justify-center rounded-sm px-2 py-1 leading-tight hover:bg-black/5";

export async function SiteHeader() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email;

  return (
    <header className="text-text-primary">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="border-b border-border-default bg-chrome-nav">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 text-sm">
          <MobileMenu userName={firstName} />

          <Link
            href="/"
            className="flex shrink-0 items-center rounded-sm px-1.5 py-2"
          >
            <AmazonLogo className="h-8 w-auto" />
          </Link>

          <div className="hidden shrink-0 flex-col justify-center px-2 py-1 leading-tight lg:flex">
            <span className="pl-3 text-xs text-text-secondary">Deliver to</span>
            <span className="flex items-center gap-0.5 text-sm font-bold">
              <PinIcon className="h-3.5 w-3.5" /> United States
            </span>
          </div>

          {/* Search */}
          <SearchBox />

          <div className={`${cell} ml-auto hidden text-xs sm:flex`}>
            <span>&nbsp;</span>
            <span className="flex items-center gap-1 font-bold">
              <UsFlagIcon className="h-3 w-[18px] rounded-[1px]" />
              EN <ChevronDownIcon className="h-3 w-3 text-text-muted" />
            </span>
          </div>

          <div className="ml-auto sm:ml-0">
            <AccountMenu isAuthed={!!session?.user} firstName={firstName} />
          </div>

          <Link href="/account/orders" className={`${cell} hidden text-xs md:flex`}>
            <span>Returns</span>
            <span className="text-sm font-bold">&amp; Orders</span>
          </Link>

          <CartBadge />
        </div>
      </div>

      {/* ── Nav belt ────────────────────────────────────────────── */}
      <nav className="bg-chrome-belt">
        <div className="mx-auto flex max-w-[1500px] items-center gap-0.5 overflow-x-auto px-1.5 py-0.5 text-sm">
          <Link
            href="/s"
            className="flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1.5 font-bold hover:bg-black/5"
          >
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-[2px] w-3.5 bg-text-primary" />
              <span className="block h-[2px] w-3.5 bg-text-primary" />
              <span className="block h-[2px] w-3.5 bg-text-primary" />
            </span>
            All
          </Link>
          {BELT_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="shrink-0 rounded-sm px-2 py-1.5 hover:bg-black/5"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
