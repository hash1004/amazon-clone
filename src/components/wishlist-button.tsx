"use client";

import { usePathname, useRouter } from "next/navigation";
import { useWishlist, type WishlistEntry } from "@/lib/wishlist-store";
import { useToast } from "@/lib/toast";
import { useAuthed } from "@/lib/auth-context";
import { HeartIcon } from "@/components/ui/icons";

export function WishlistButton({
  entry,
  variant = "full",
}: {
  entry: WishlistEntry;
  variant?: "full" | "icon";
}) {
  const { has, toggle, ready } = useWishlist();
  const { toast } = useToast();
  const isAuthed = useAuthed();
  const router = useRouter();
  const pathname = usePathname();

  const saved = ready && isAuthed && has(entry.productId);

  const onToggle = () => {
    if (!isAuthed) {
      router.push(
        `/login?from=wishlist&callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }
    toggle(entry);
    toast(saved ? "Removed from your List" : "Added to your List");
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={saved ? "Remove from List" : "Add to List"}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className="rounded-full border border-border-default bg-surface/90 p-1.5 shadow-sm hover:bg-subtle"
      >
        <HeartIcon className={`h-4 w-4 ${saved ? "text-accent" : ""}`} filled={saved} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      className="flex w-full items-center justify-center gap-1.5 rounded-pill border border-border-strong px-4 py-1.5 text-sm hover:bg-subtle"
    >
      <HeartIcon className={`h-4 w-4 ${saved ? "text-accent" : ""}`} filled={saved} />
      {saved ? "Added to List" : "Add to List"}
    </button>
  );
}
