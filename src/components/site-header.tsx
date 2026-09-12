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
 */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-border-default bg-chrome-nav text-text-primary">
      <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:px-6">
        <div className="justify-self-start">
          <CategoriesMenu />
        </div>

        <Link href="/" className="justify-self-center">
          <AmazonLogo className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-1 justify-self-end">
          <ExpandingSearch />
          <AccountMenu isAuthed={!!session?.user} firstName={session?.user?.name?.split(" ")[0] ?? session?.user?.email} />
          <WishlistBadge />
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
