import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import { WishlistBadge } from "@/components/wishlist-badge";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ExpandingSearch } from "@/components/search/expanding-search";
import { AccountMenu } from "@/components/account-menu";
import { auth } from "@/auth";

/**
 * Single-category store, so there's no department flyout to anchor a
 * three-zone grid — just a plain left/right split: wordmark (left) +
 * search + account + wishlist + cart icons (right). Same split on phones,
 * where Account, Cart and Wishlist move to the bottom nav instead (see
 * mobile-bottom-nav.tsx).
 */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-border-default bg-chrome-nav text-text-primary">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        <Link href="/" className="group relative overflow-hidden rounded-sm px-1">
          <BrandLogo className="h-8 w-auto" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent mix-blend-overlay transition-transform duration-700 ease-out group-hover:translate-x-[400%]"
          />
        </Link>

        <div className="flex items-center gap-1">
          <ExpandingSearch />
          <span className="hidden sm:block">
            <AccountMenu
              isAuthed={!!session?.user}
              firstName={session?.user?.name?.split(" ")[0] ?? session?.user?.email}
            />
          </span>
          <span className="hidden sm:block">
            <WishlistBadge />
          </span>
          <span className="hidden sm:block">
            <CartBadge />
          </span>
        </div>
      </div>
    </header>
  );
}
