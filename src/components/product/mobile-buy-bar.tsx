"use client";

import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";
import { formatPrice } from "@/lib/format";
import { BeanIcon, CheckIcon } from "@/components/ui/icons";

export function MobileBuyBar({
  product,
  inStock,
}: {
  product: Omit<CartLine, "quantity">;
  inStock: boolean;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-2 border-t border-border-default bg-surface px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-2px_8px_rgba(0,0,0,0.08)] lg:hidden">
      <span className="shrink-0 text-lg font-medium">
        {formatPrice(product.priceCents)}
      </span>
      <button
        type="button"
        disabled={!inStock}
        aria-label="Add to cart"
        onClick={() => {
          add(product, 1);
          toast("Added to Cart");
          setAdded(true);
          setTimeout(() => setAdded(false), 1800);
        }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-chrome-nav text-text-on-brown disabled:opacity-50"
      >
        {added ? <CheckIcon className="h-5 w-5" /> : <BeanIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
