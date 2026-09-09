"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";

export type ReorderItem = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
  quantity: number;
};

export function ReorderButton({ items }: { items: ReorderItem[] }) {
  const { add } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        items.forEach(({ quantity, ...line }) => add(line, quantity));
        toast("Items added to your Cart");
        setDone(true);
        setTimeout(() => router.push("/cart"), 500);
      }}
      className="rounded-pill border border-border-strong px-4 py-1.5 text-sm hover:bg-subtle"
    >
      {done ? "Added to cart…" : "Buy it again"}
    </button>
  );
}
