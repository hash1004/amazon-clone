"use client";

import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";

export function QuickAdd({
  product,
  disabled = false,
}: {
  product: Omit<CartLine, "quantity">;
  disabled?: boolean;
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(product, 1);
        toast("Added to Cart");
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="mt-1 w-full max-w-[220px] rounded-pill bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {added ? "✓ Added" : "Add to cart"}
    </button>
  );
}
