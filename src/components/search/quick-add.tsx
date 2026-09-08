"use client";

import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart-store";

export function QuickAdd({ product }: { product: Omit<CartLine, "quantity"> }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="mt-1 w-full max-w-[220px] rounded-pill bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-hover"
    >
      {added ? "✓ Added" : "Add to cart"}
    </button>
  );
}
