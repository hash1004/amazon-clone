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
      <h2 className="mb-4 font-serif text-lg font-medium text-text-primary">
        Frequently bought together
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        {all.map((it, i) => (
          <div key={it.productId} className="flex items-center gap-3">
            <FBTCard
              item={it}
              isMain={i === 0}
              checked={!!checked[it.productId]}
              onToggle={() =>
                setChecked((c) => ({ ...c, [it.productId]: !c[it.productId] }))
              }
            />
            {i < all.length - 1 && (
              <span className="text-lg text-text-muted">+</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <p className="text-sm text-text-secondary">
          Total:{" "}
          <span className="text-lg font-semibold text-text-primary">
            {formatPrice(total)}
          </span>{" "}
          for {selected.length} item{selected.length === 1 ? "" : "s"}
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
          className="rounded-pill bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? "✓ Added to Cart" : `Add ${selected.length} to Cart`}
        </button>
      </div>
    </section>
  );
}

function FBTCard({
  item,
  isMain,
  checked,
  onToggle,
}: {
  item: FBTItem;
  isMain: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`relative flex w-32 shrink-0 flex-col gap-2 rounded-lg border border-border-default bg-surface p-2.5 transition sm:w-36 ${
        checked ? "" : "opacity-50"
      }`}
    >
      <button
        type="button"
        aria-label={checked ? "Remove from bundle" : "Add to bundle"}
        aria-pressed={checked}
        onClick={onToggle}
        className={`absolute right-1.5 top-1.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border text-[10px] transition ${
          checked
            ? "border-border-accent bg-accent text-accent-fg"
            : "border-border-strong bg-surface text-transparent"
        }`}
      >
        ✓
      </button>
      <Link href={`/p/${item.slug}`} className="relative aspect-square w-full overflow-hidden rounded-md bg-subtle">
        <Image src={item.image} alt={item.title} fill sizes="144px" className="object-contain p-2" />
      </Link>
      <Link href={`/p/${item.slug}`} className="line-clamp-2 text-xs leading-tight text-text-primary hover:text-text-accent">
        {isMain ? "This item: " : null}
        {item.title}
      </Link>
      <p className="text-sm font-semibold text-text-primary">
        {formatPrice(item.priceCents)}
      </p>
    </div>
  );
}
