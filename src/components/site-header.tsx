import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { BrowseMenu } from "@/components/browse-menu";
import { ShopMenu } from "@/components/shop-menu";
import { AccountMenu } from "@/components/account-menu";
import { WishlistBadge } from "@/components/wishlist-badge";
import { CartBadge } from "@/components/cart-badge";
import { auth } from "@/auth";

/**
 * Three-zone header — browse/search (left) — wordmark (center) — account,
 * wishlist and cart (right). On phones those three collapse into one
 * ShopMenu icon (no room for three, and no bottom nav to fall back to);
 * on wider screens there's space to show them separately instead of
 * hiding everything behind one door.
 */
export async function SiteHeader() {
  const session = await auth();
  const isAuthed = !!session?.user;
  const firstName = session?.user?.name?.split(" ")[0] ?? session?.user?.email;

  return (
    <header
      className="grain bg-chrome-nav text-text-on-brown"
      style={{ ["--icon-hover-bg" as string]: "rgba(243, 234, 217, 0.14)" }}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-2 px-6 py-2.5 sm:px-10">
        <BrowseMenu />

        <Link
          href="/"
          className="group relative mx-auto overflow-hidden rounded-sm px-1"
        >
          <BrandLogo className="h-5 w-auto sm:h-7" tone="light" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent mix-blend-overlay transition-transform duration-700 ease-out group-hover:translate-x-[400%]"
          />
        </Link>

        <div className="flex items-center gap-1">
          <span className="hidden items-center gap-1 sm:flex">
            <AccountMenu isAuthed={isAuthed} firstName={firstName} />
            <WishlistBadge />
            <CartBadge />
          </span>
          <span className="sm:hidden">
            <ShopMenu isAuthed={isAuthed} firstName={firstName} />
          </span>
        </div>
      </div>
    </header>
  );
}
