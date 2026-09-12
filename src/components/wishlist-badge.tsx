"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-store";
import { HeartIcon } from "@/components/ui/icons";
import { PulseDot } from "@/components/ui/pulse-dot";

export function WishlistBadge() {
  const { count, ready } = useWishlist();
  const nonEmpty = ready && count > 0;
  return (
    <Link
      href="/wishlist"
      aria-label={nonEmpty ? `Your List, ${count} items` : "Your List"}
      className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
    >
      <HeartIcon className="h-5 w-5" />
      {nonEmpty && <PulseDot />}
    </Link>
  );
}
