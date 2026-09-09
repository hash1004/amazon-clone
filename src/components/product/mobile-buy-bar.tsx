"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartLine } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";
import { formatPrice } from "@/lib/format";

export function MobileBuyBar({
  product,
  inStock,
}: {
  product: Omit<CartLine, "quantity">;
  inStock: boolean;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-border-default bg-surface px-3 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] lg:hidden">
      <span className="shrink-0 text-lg font-bold">
        {formatPrice(product.priceCents)}
      </span>
      <button
        type="button"
        disabled={!inStock}
        onClick={() => {
          add(product, 1);
          toast("Added to Cart");
        }}
        className="flex-1 rounded-pill bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
      >
        Add to Cart
      </button>
      <button
        type="button"
        disabled={!inStock}
        onClick={() => {
          add(product, 1);
          router.push("/checkout");
        }}
        className="flex-1 rounded-pill bg-accent-buy px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-50"
      >
        Buy Now
      </button>
    </div>
  );
}
