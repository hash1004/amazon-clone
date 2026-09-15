"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { PulseDot } from "@/components/ui/pulse-dot";
import {
  HomeIcon,
  CategoriesIcon,
  CartIcon,
  HeartIcon,
  PersonIcon,
} from "@/components/ui/icons";

/**
 * Phone-only bottom nav (sm:hidden) — Home, Categories, Cart, Wishlist and
 * Profile all move down here instead of being duplicated in the header,
 * which slims down to just the wordmark + search on phones (see
 * site-header.tsx). Categories and Profile open full pages rather than
 * dropdowns — a tap target is a worse fit for a hover-style flyout menu.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { count: cartCount, ready: cartReady } = useCart();
  const { count: wishCount, ready: wishReady } = useWishlist();

  const items = [
    { href: "/", label: "Home", icon: HomeIcon, active: pathname === "/" },
    {
      href: "/categories",
      label: "Categories",
      icon: CategoriesIcon,
      active: pathname.startsWith("/categories"),
    },
    {
      href: "/cart",
      label: "Cart",
      icon: CartIcon,
      active: pathname.startsWith("/cart"),
      dot: cartReady && cartCount > 0,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: HeartIcon,
      active: pathname.startsWith("/wishlist"),
      dot: wishReady && wishCount > 0,
    },
    {
      href: "/account",
      label: "Profile",
      icon: PersonIcon,
      active: pathname.startsWith("/account"),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-default bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      {items.map(({ href, label, icon: Icon, active, dot }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={`relative flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium ${
            active ? "text-text-accent" : "text-text-secondary"
          }`}
        >
          <span className="relative">
            <Icon className="h-5 w-5" />
            {dot && <PulseDot />}
          </span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
