"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { CartIcon } from "@/components/ui/icons";
import { PulseDot } from "@/components/ui/pulse-dot";

export function CartBadge() {
  const { count, ready } = useCart();
  const nonEmpty = ready && count > 0;
  return (
    <Link
      href="/cart"
      aria-label={nonEmpty ? `Cart, ${count} items` : "Cart"}
      className="icon-hover relative flex h-9 w-9 items-center justify-center rounded-full"
    >
      <CartIcon className="h-5 w-5" />
      {nonEmpty && <PulseDot />}
    </Link>
  );
}
