"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lineKey, useCart, type CartLine } from "@/lib/cart-store";
import { GRINDS, isGrind, weightLabel } from "@/lib/variants";
import { formatPrice } from "@/lib/format";
import { useStock } from "@/lib/use-stock";
import { LOW_STOCK_THRESHOLD } from "@/lib/product-display";

export default function CartPage() {
  const { lines, subtotalCents, count, ready, setQuantity, remove, setGrind } = useCart();
  const router = useRouter();
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const stock = useStock(productIds);
  // Stock is counted in standard bags and shared by every grind/size line of
  // a coffee, so each line gets whatever the lines above it haven't used.
  const room = stock ? roomPerLine(lines, stock) : null;
  const shortLines = room ? lines.filter((l) => l.quantity > room[lineKey(l)]) : [];

  if (ready && lines.length === 0) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-medium text-text-primary">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your cart lives here. Give it purpose — pick a roast to start.
        </p>
        <Link
          href="/s"
          className="mt-5 inline-block rounded-control bg-accent px-6 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Keep shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-serif text-2xl font-medium text-text-primary">
          Your cart
        </h1>

        <ul className="mt-4 divide-y divide-border-default rounded-lg border border-border-default bg-surface">
          {lines.map((l) => {
            const key = lineKey(l);
            const fits = room?.[key];
            return (
            <li key={key} className="flex gap-4 p-4">
              <Link
                href={`/p/${l.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border-default bg-subtle"
              >
                {l.image ? (
                  <Image
                    src={l.image}
                    alt={l.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/p/${l.slug}`}
                  className="line-clamp-2 text-sm font-medium hover:text-text-accent"
                >
                  {l.title}
                </Link>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {l.grams ? `${weightLabel(l.grams)} bag · ` : ""}
                  {formatPrice(l.priceCents)} each
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <label className="flex items-center gap-1.5 text-text-secondary">
                    Grind
                    <select
                      value={l.grind}
                      onChange={(e) => isGrind(e.target.value) && setGrind(key, e.target.value)}
                      className="border border-border-default bg-canvas px-2 py-1 text-text-primary"
                    >
                      {GRINDS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-1.5 text-text-secondary">
                    Qty
                    <select
                      value={l.quantity}
                      onChange={(e) => setQuantity(key, Number(e.target.value))}
                      className="border border-border-default bg-canvas px-2 py-1 text-text-primary"
                    >
                      {/* Up to 10, or what's left if that's fewer; always keep the
                          current value selectable so an over-stock line still shows. */}
                      {Array.from(
                        { length: Math.max(l.quantity, Math.min(10, fits ?? 10)) },
                        (_, i) => i + 1,
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={() => remove(key)} className="link">
                    Remove
                  </button>
                </div>

                <StockNote left={fits} quantity={l.quantity} />
              </div>

              <p className="shrink-0 text-sm font-medium text-text-primary">
                {formatPrice(l.priceCents * l.quantity)}
              </p>
            </li>
            );
          })}
        </ul>
      </div>

      <aside className="h-fit rounded-lg border border-border-default bg-surface p-5">
        <p className="text-sm text-text-secondary">
          Subtotal ({count} {count === 1 ? "item" : "items"})
        </p>
        <p className="mt-1 font-serif text-2xl font-medium text-text-primary">
          {formatPrice(subtotalCents)}
        </p>
        {shortLines.length > 0 && (
          <p className="mt-3 text-xs text-danger">
            Some coffees in your cart are low or sold out. Adjust them to continue.
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          disabled={shortLines.length > 0}
          className="mt-4 w-full rounded-control bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent"
        >
          Proceed to checkout
        </button>
      </aside>
    </div>
  );
}

/** Bags of each line's size that stock can still fill, after earlier lines of the same coffee. */
function roomPerLine(lines: CartLine[], stock: Record<string, number>): Record<string, number> {
  const left = { ...stock };
  const room: Record<string, number> = {};
  for (const l of lines) {
    const units = l.units || 1;
    const fits = Math.floor((left[l.productId] ?? 0) / units);
    room[lineKey(l)] = fits;
    left[l.productId] = (left[l.productId] ?? 0) - Math.min(fits, l.quantity) * units;
  }
  return room;
}

/** Per-line stock message; nothing while stock is still loading or plentiful. */
function StockNote({ left, quantity }: { left: number | undefined; quantity: number }) {
  if (left === undefined) return null;
  if (left === 0) return <p className="mt-2 text-xs font-medium text-danger">Sold out. Remove it to continue.</p>;
  if (quantity > left)
    return (
      <p className="mt-2 text-xs font-medium text-danger">
        Only {left} left. Lower the quantity to {left} or fewer.
      </p>
    );
  if (left <= LOW_STOCK_THRESHOLD)
    return <p className="mt-2 text-xs font-medium text-warning">Only {left} left in stock</p>;
  return null;
}
