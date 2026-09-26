"use client";

import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";
import { formatPrice } from "@/lib/format";

export function AddToCart({
  product,
  inStock,
  maxQty = 10,
}: {
  product: Omit<CartLine, "quantity">;
  inStock: boolean;
  /** Bags left in stock; the picker never goes past it (or past 10). */
  maxQty?: number;
}) {
  const limit = Math.max(1, Math.min(10, maxQty));
  const { add } = useCart();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!inStock) {
    return (
      <p className="bg-subtle p-3 text-sm font-medium text-text-deal">
        Currently unavailable.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3 rounded-pill border border-border-strong px-1 py-1">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-8 w-8 items-center justify-center text-lg leading-none transition hover:bg-subtle active:scale-95"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums">
          {String(qty).padStart(2, "0")}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => Math.min(limit, q + 1))}
          disabled={qty >= limit}
          className="flex h-8 w-8 items-center justify-center text-lg leading-none transition hover:bg-subtle active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          add(product, qty);
          toast(`Added ${qty} to Cart`);
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className="flex-1 rounded-pill bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-all duration-200 hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
      >
        {added ? "✓ Added to Cart" : `Add to Cart · ${formatPrice(product.priceCents * qty)}`}
      </button>
    </div>
  );
}
