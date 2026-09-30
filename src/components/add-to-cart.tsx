"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useToast } from "@/lib/toast";
import { discountPct, formatPrice } from "@/lib/format";
import { PriceTag } from "@/components/ui/price-tag";
import {
  DEFAULT_GRIND,
  DEFAULT_SIZE,
  GRINDS,
  SIZES,
  variantFor,
  variantSummary,
  weightLabel,
  type Grind,
  type Size,
} from "@/lib/variants";

export type PurchasableProduct = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
  listPriceCents: number | null;
  weightGrams: number;
  /** Standard bags left. */
  stock: number;
};

/**
 * The product page's buy box: price for the chosen size, then size, grind,
 * quantity and Add to cart. Price lives here rather than in the page
 * because it follows the size choice.
 */
export function AddToCart({ product }: { product: PurchasableProduct }) {
  const { add } = useCart();
  const { toast } = useToast();
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);
  const [grind, setGrind] = useState<Grind>(DEFAULT_GRIND);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variantFor(product, size);
  // Bags of this size the shelf can still fill, capped at 10 per add.
  const limit = Math.min(10, Math.floor(product.stock / variant.units));
  const pct = discountPct(variant.priceCents, variant.listPriceCents);
  const standard = variantFor(product, "standard");

  if (product.stock <= 0) {
    return (
      <p className="bg-subtle p-3 text-sm font-medium text-danger">
        Currently unavailable.
      </p>
    );
  }

  const chooseSize = (next: Size) => {
    setSize(next);
    const nextLimit = Math.min(10, Math.floor(product.stock / variantFor(product, next).units));
    setQty((q) => Math.max(1, Math.min(q, nextLimit)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <PriceTag cents={variant.priceCents} size="lg" />
        {pct > 0 && (
          <>
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(variant.listPriceCents!)}
            </span>
            <span className="bg-accent-subtle px-2 py-0.5 text-xs font-bold text-text-accent">
              {pct}% off
            </span>
          </>
        )}
        <span className="text-sm text-text-secondary">/ {weightLabel(variant.grams)} bag</span>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-medium text-text-primary">Bag size</legend>
        <div className="grid grid-cols-2 gap-2">
          {SIZES.map((s) => {
            const v = variantFor(product, s);
            const soldOut = product.stock < v.units;
            const perGram = (cents: number, grams: number) => cents / grams;
            const saving = Math.round(
              (1 - perGram(v.priceCents, v.grams) / perGram(standard.priceCents, standard.grams)) *
                100,
            );
            return (
              <label
                key={s}
                className={`flex flex-col border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-border-accent ${
                  size === s
                    ? "border-border-accent bg-accent-subtle"
                    : "border-border-strong bg-surface hover:bg-subtle"
                } ${soldOut ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={size === s}
                  disabled={soldOut}
                  onChange={() => chooseSize(s)}
                  className="sr-only"
                />
                <span className="font-medium text-text-primary">{weightLabel(v.grams)}</span>
                <span className="text-text-secondary">
                  {formatPrice(v.priceCents)}
                  {soldOut ? " · sold out" : saving > 0 ? ` · save ${saving}%` : ""}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium text-text-primary">Grind</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRINDS.map((g) => (
            <label
              key={g.id}
              className={`flex cursor-pointer flex-col border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-border-accent ${
                grind === g.id
                  ? "border-border-accent bg-accent-subtle"
                  : "border-border-strong bg-surface hover:bg-subtle"
              }`}
            >
              <input
                type="radio"
                name="grind"
                value={g.id}
                checked={grind === g.id}
                onChange={() => setGrind(g.id)}
                className="sr-only"
              />
              <span className="font-medium text-text-primary">{g.label}</span>
              <span className="text-xs text-text-secondary">{g.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-control border border-border-strong px-1 py-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="flex h-8 w-8 items-center justify-center text-lg leading-none transition hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            −
          </button>
          <output
            aria-live="polite"
            aria-label={`Quantity ${qty}`}
            className="w-5 text-center text-sm font-semibold tabular-nums"
          >
            {qty}
          </output>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(limit, q + 1))}
            disabled={qty >= limit}
            className="flex h-8 w-8 items-center justify-center text-lg leading-none transition hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            add(
              {
                productId: product.productId,
                slug: product.slug,
                title: product.title,
                image: product.image,
                priceCents: variant.priceCents,
                grind,
                size,
                grams: variant.grams,
                units: variant.units,
              },
              qty,
            );
            toast(`Added to cart: ${qty} × ${variantSummary(grind, variant.grams)}`);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className="flex-1 rounded-control bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition-colors duration-200 hover:bg-accent-hover"
        >
          {added ? "✓ Added to cart" : `Add to cart · ${formatPrice(variant.priceCents * qty)}`}
        </button>
      </div>
    </div>
  );
}
