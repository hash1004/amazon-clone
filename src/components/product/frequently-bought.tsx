"use client";

import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";
import { formatPrice } from "@/lib/format";

export type FBTItem = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
};

export function FrequentlyBought({
  main,
  companions,
}: {
  main: FBTItem;
  companions: FBTItem[];
}) {
  const { add } = useCart();
  const { toast } = useToast();
  const all = [main, ...companions];
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(all.map((i) => [i.productId, true])),
  );
  const [added, setAdded] = useState(false);

  const selected = all.filter((i) => checked[i.productId]);
  const total = selected.reduce((n, i) => n + i.priceCents, 0);

  if (companions.length === 0) return null;

  return (
    <section className="mt-8 border-t border-border-default pt-5">
      <h2 className="mb-3 text-lg font-bold">Frequently bought together</h2>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {all.map((it, i) => (
            <div key={it.productId} className="flex items-center gap-2">
              <Link
                href={`/p/${it.slug}`}
                className="relative h-24 w-24 shrink-0 bg-white"
              >
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                />
              </Link>
              {i < all.length - 1 && (
                <span className="text-2xl text-text-secondary">+</span>
              )}
            </div>
          ))}
        </div>

        <div className="lg:ml-4">
          <p className="text-sm">
            Total price:{" "}
            <span className="text-lg font-bold text-text-deal">
              {formatPrice(total)}
            </span>
          </p>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => {
              selected.forEach((i) =>
                add(
                  {
                    productId: i.productId,
                    slug: i.slug,
                    title: i.title,
                    image: i.image,
                    priceCents: i.priceCents,
                  },
                  1,
                ),
              );
              toast(`${selected.length} items added to your Cart`);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            className="mt-1 rounded-pill bg-accent px-5 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
          >
            {added ? "✓ Added to Cart" : `Add ${selected.length} to Cart`}
          </button>
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {all.map((it, i) => (
          <li key={it.productId} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={!!checked[it.productId]}
              onChange={(e) =>
                setChecked((c) => ({ ...c, [it.productId]: e.target.checked }))
              }
              className="mt-1 h-3.5 w-3.5"
            />
            <span>
              {i === 0 ? (
                <span className="font-medium">This item: </span>
              ) : null}
              <Link href={`/p/${it.slug}`} className="link">
                {it.title}
              </Link>{" "}
              <span className="text-text-deal">{formatPrice(it.priceCents)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
