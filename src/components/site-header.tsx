import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { BrowseMenu } from "@/components/browse-menu";
import { ShopMenu } from "@/components/shop-menu";
import { auth } from "@/auth";

/**
 * Three-zone header — browse/search (left) — wordmark (center) — cart,
 * wishlist and account behind one icon (right). No bottom nav to fall
 * back to on phones anymore, so every icon here is visible at every
 * width instead of half of them hiding until sm:.
 */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header
      className="grain bg-chrome-nav text-text-on-brown"
      style={{ ["--icon-hover-bg" as string]: "rgba(243, 234, 217, 0.14)" }}
    >
      <div className="mx-auto grid max-w-[1500px] grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5 sm:px-6">
        <BrowseMenu />

        <Link
          href="/"
          className="group relative mx-auto overflow-hidden rounded-sm px-1"
        >
          <BrandLogo className="h-8 w-auto" tone="light" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent mix-blend-overlay transition-transform duration-700 ease-out group-hover:translate-x-[400%]"
          />
        </Link>

        <ShopMenu
          isAuthed={!!session?.user}
          firstName={session?.user?.name?.split(" ")[0] ?? session?.user?.email}
        />
      </div>
    </header>
  );
}
