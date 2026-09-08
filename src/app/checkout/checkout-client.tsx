"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { orderTotals } from "@/lib/pricing";

export function CheckoutClient({ defaultName }: { defaultName: string }) {
  const { lines, subtotalCents, ready, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const totals = orderTotals(subtotalCents);

  if (ready && lines.length === 0) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8 text-center">
        <p className="text-lg font-bold">Your cart is empty.</p>
        <Link href="/s" className="link mt-2 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
        shipping: {
          name: form.get("name"),
          line1: form.get("line1"),
          line2: form.get("line2"),
          city: form.get("city"),
          state: form.get("state"),
          postal: form.get("postal"),
        },
        cardLast4: form.get("card"),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not place your order.");
      setPending(false);
      return;
    }

    clear();
    router.push(`/orders/${data.orderId}?placed=1`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid max-w-[1100px] gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-4">
        <section className="bg-surface p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Shipping address</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="name" label="Full name" defaultValue={defaultName} required span2 />
            <Field name="line1" label="Address line 1" required span2 />
            <Field name="line2" label="Address line 2 (optional)" span2 />
            <Field name="city" label="City" required />
            <Field name="state" label="State" required />
            <Field name="postal" label="ZIP code" required />
          </div>
        </section>

        <section className="bg-surface p-4 shadow-sm">
          <h2 className="mb-1 text-lg font-bold">Payment</h2>
          <p className="mb-3 text-xs text-text-secondary">
            Mock payment — no real charge. Any 16-digit number works (e.g.
            4242 4242 4242 4242).
          </p>
          <Field
            name="card"
            label="Card number"
            required
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
          />
        </section>

        <section className="bg-surface p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Review items</h2>
          <ul className="divide-y divide-border-default">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-3 py-3">
                <div className="relative h-16 w-16 shrink-0 bg-white">
                  {l.image && (
                    <Image
                      src={l.image}
                      alt={l.title}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm">{l.title}</p>
                  <p className="text-xs text-text-secondary">
                    Qty {l.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold">
                  {formatPrice(l.priceCents * l.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="h-fit bg-surface p-4 shadow-sm">
        <h2 className="text-lg font-bold">Order summary</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <Row label="Items" value={formatPrice(totals.subtotalCents)} />
          <Row
            label="Shipping"
            value={
              totals.shippingCents === 0
                ? "FREE"
                : formatPrice(totals.shippingCents)
            }
          />
          <Row label="Estimated tax" value={formatPrice(totals.taxCents)} />
          <div className="border-t border-border-default pt-1">
            <Row
              label="Order total"
              value={formatPrice(totals.totalCents)}
              bold
            />
          </div>
        </dl>

        {error && (
          <p className="mt-3 rounded-md bg-danger-subtle p-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !ready}
          className="mt-3 w-full rounded-pill bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Placing order…" : "Place your order"}
        </button>
        <p className="mt-2 text-xs text-text-secondary">
          By placing your order you agree this is a demo with no real
          transaction.
        </p>
      </aside>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  defaultValue,
  placeholder,
  inputMode,
  span2,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  inputMode?: "numeric";
  span2?: boolean;
}) {
  return (
    <label className={`block text-sm font-bold ${span2 ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-1 w-full rounded-md border border-border-strong px-2 py-1.5 text-sm font-normal"
      />
    </label>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
