"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartBadge() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      className="flex shrink-0 items-end gap-1 rounded-sm border border-transparent px-2 py-1.5 hover:border-white"
    >
      <span className="relative">
        <span aria-hidden className="text-2xl">🛒</span>
        <span className="absolute -right-1 top-0 min-w-4 rounded-full bg-accent px-1 text-center text-xs font-bold leading-4 text-accent-fg">
          {ready ? count : 0}
        </span>
      </span>
      <span className="text-sm font-bold">Cart</span>
    </Link>
  );
}
