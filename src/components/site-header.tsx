import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import { WishlistBadge } from "@/components/wishlist-badge";
import { AmazonLogo } from "@/components/ui/amazon-logo";
import { CategoriesMenu } from "@/components/categories-menu";
import { ExpandingSearch } from "@/components/search/expanding-search";
import { AccountMenu } from "@/components/account-menu";
import { auth } from "@/auth";

/**
 * Three-zone header: categories flyout (left) — wordmark (center) — search
 * + account + wishlist + cart icons (right). Deliver-to, the language
 * selector, and Returns & Orders are dropped, not relocated — see
 * design/redesign-v2-spec.md.
 *
 * On phones the header slims down to just the wordmark + search —
 * Categories, Account, Cart and Wishlist all move to the bottom nav
 * (see mobile-bottom-nav.tsx) instead of being duplicated up here too.
 */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-border-default bg-chrome-nav text-text-primary">
      <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:px-6">
        <div className="hidden justify-self-start sm:block">
          <CategoriesMenu />
        </div>

        <Link
          href="/"
          className="group relative justify-self-center overflow-hidden rounded-sm px-1"
        >
          <AmazonLogo className="h-8 w-auto" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent mix-blend-overlay transition-transform duration-700 ease-out group-hover:translate-x-[400%]"
          />
        </Link>

        <div className="flex items-center gap-1 justify-self-end">
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
