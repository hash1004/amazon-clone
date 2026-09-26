"use client";

import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";
import { BeanIcon, CheckIcon } from "@/components/ui/icons";

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
      aria-label="Add to cart"
      title="Add to cart"
      onClick={() => {
        add(product, 1);
        toast("Added to Cart");
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="mt-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-chrome-nav text-text-on-brown transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {added ? <CheckIcon className="h-4 w-4" /> : <BeanIcon className="h-4 w-4" />}
    </button>
  );
}
