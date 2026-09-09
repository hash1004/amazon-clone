"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { CartIcon } from "@/components/ui/icons";

export function CartBadge() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      className="flex shrink-0 items-end gap-1 rounded-sm px-2 py-1 hover:bg-white/10"
    >
      <span className="relative">
        <CartIcon className="h-8 w-8" />
        <span className="absolute -top-1 left-3.5 min-w-4 text-center text-base font-bold text-accent-buy">
          {ready ? count : 0}
        </span>
      </span>
      <span className="pb-0.5 text-sm font-bold">Cart</span>
    </Link>
  );
}
