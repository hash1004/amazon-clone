"use client";

import { useWishlist, type WishlistEntry } from "@/lib/wishlist-store";

export function WishlistButton({
  entry,
  variant = "full",
}: {
  entry: WishlistEntry;
  variant?: "full" | "icon";
}) {
  const { has, toggle, ready } = useWishlist();
  const saved = ready && has(entry.productId);

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={saved ? "Remove from List" : "Add to List"}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          toggle(entry);
        }}
        className="rounded-full border border-border-default bg-surface/90 p-1.5 shadow-sm hover:bg-subtle"
      >
        <HeartIcon filled={saved} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(entry)}
      aria-pressed={saved}
      className="flex w-full items-center justify-center gap-1.5 rounded-pill border border-border-strong px-4 py-1.5 text-sm hover:bg-subtle"
    >
      <HeartIcon filled={saved} />
      {saved ? "Added to List" : "Add to List"}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "#c7511f" : "none"}
      stroke={filled ? "#c7511f" : "currentColor"}
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 21s-7.5-4.6-10-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 10 6c-2.5 4.4-10 9-10 9Z" />
    </svg>
  );
}
