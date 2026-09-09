"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";

export function AddToCart({
  product,
  inStock,
}: {
  product: Omit<CartLine, "quantity">;
  inStock: boolean;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  if (!inStock) {
    return (
      <p className="rounded-md bg-subtle p-3 text-sm font-medium text-text-deal">
        Currently unavailable.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm">
        Quantity:
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded-md border border-border-strong bg-subtle px-2 py-1"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => {
          add(product, qty);
          toast(`Added ${qty} to Cart`);
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className="w-full rounded-pill bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
      >
        {added ? "✓ Added to Cart" : "Add to Cart"}
      </button>

      <button
        type="button"
        disabled={buying}
        onClick={() => {
          setBuying(true);
          add(product, qty);
          router.push("/checkout");
        }}
        className="w-full rounded-pill bg-accent-buy px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-buy-hover disabled:opacity-70"
      >
        {buying ? "…" : "Buy Now"}
      </button>
    </div>
  );
}
