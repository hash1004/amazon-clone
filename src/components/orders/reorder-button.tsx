"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";

export function ReorderButton({ items }: { items: CartLine[] }) {
  const { add } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        items.forEach(({ quantity, ...line }) => add(line, quantity));
        toast("Added to your cart");
        setDone(true);
        setTimeout(() => router.push("/cart"), 500);
      }}
      className="rounded-control border border-border-strong px-4 py-1.5 text-sm hover:bg-subtle"
    >
      {done ? "Added to cart…" : "Buy it again"}
    </button>
  );
}
