"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lines, subtotalCents, count, ready, setQuantity, remove } = useCart();
  const router = useRouter();

  if (ready && lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-6">
        <div className="bg-surface p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Your Amazon Cart is empty</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your shopping cart lives here. Give it purpose — fill it with
            groceries, electronics, or a new pair of shoes.
          </p>
          <Link
            href="/s"
            className="mt-4 inline-block rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1200px] gap-4 px-4 py-6 lg:grid-cols-[1fr_300px]">
      <div className="bg-surface p-4 shadow-sm">
        <h1 className="border-b border-border-default pb-2 text-2xl font-bold">
          Shopping Cart
        </h1>

        <ul>
          {lines.map((l) => (
            <li
              key={l.productId}
              className="flex gap-4 border-b border-border-default py-4"
            >
              <Link
                href={`/p/${l.slug}`}
                className="relative h-24 w-24 shrink-0 bg-white"
              >
                {l.image ? (
                  <Image
                    src={l.image}
                    alt={l.title}
                    fill
                    sizes="96px"
                    className="object-contain p-1"
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
                <p className="mt-1 text-lg font-bold">
                  {formatPrice(l.priceCents)}
                </p>

                <div className="mt-2 flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1">
                    Qty:
                    <select
                      value={l.quantity}
                      onChange={(e) =>
                        setQuantity(l.productId, Number(e.target.value))
                      }
                      className="rounded-md border border-border-strong bg-subtle px-2 py-1"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="text-border-strong">|</span>
                  <button
                    type="button"
                    onClick={() => remove(l.productId)}
                    className="link"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-sm font-bold">
                {formatPrice(l.priceCents * l.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <p className="pt-3 text-right text-lg">
          Subtotal ({count} {count === 1 ? "item" : "items"}):{" "}
          <span className="font-bold">{formatPrice(subtotalCents)}</span>
        </p>
      </div>

      <aside className="h-fit bg-surface p-4 shadow-sm">
        <p className="text-lg">
          Subtotal ({count} {count === 1 ? "item" : "items"}):{" "}
          <span className="font-bold">{formatPrice(subtotalCents)}</span>
        </p>
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="mt-3 w-full rounded-pill bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Proceed to checkout
        </button>
      </aside>
    </div>
  );
}
