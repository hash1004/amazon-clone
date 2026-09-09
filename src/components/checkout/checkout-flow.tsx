"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { orderTotals } from "@/lib/pricing";
import { DELIVERY_OPTIONS, deliveryRange, type DeliverySpeed } from "@/lib/delivery";
import { createAddress } from "@/lib/address-actions";
import { AddressFields } from "@/components/checkout/address-form";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal: string;
  isDefault: boolean;
};

type PayMethod = "card" | "upi" | "cod";

export function CheckoutFlow({ addresses }: { addresses: Address[] }) {
  const { lines, subtotalCents, ready, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [addrList, setAddrList] = useState(addresses);
  const [selectedId, setSelectedId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [addingAddr, setAddingAddr] = useState(addresses.length === 0);
  const [speed, setSpeed] = useState<DeliverySpeed>("standard");
  const [pay, setPay] = useState<PayMethod>("card");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "" });
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const listSubtotalCents = useMemo(
    () => lines.reduce((n, l) => n + l.priceCents * l.quantity, 0),
    [lines],
  );
  const totals = orderTotals(subtotalCents, {
    deliverySpeed: speed,
    listSubtotalCents,
  });
  const selectedAddr = addrList.find((a) => a.id === selectedId);

  if (ready && lines.length === 0) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-10 text-center">
        <p className="text-lg font-bold">Your cart is empty.</p>
        <Link href="/s" className="link mt-2 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    setError(null);
    if (!selectedAddr) {
      setError("Add a delivery address to continue.");
      setStep(1);
      return;
    }
    setPending(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        addressId: selectedAddr.id,
        deliverySpeed: speed,
        paymentMethod: pay,
        cardNumber: pay === "card" ? card.number : undefined,
        upiId: pay === "upi" ? upiId : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "We couldn't place your order.");
      return;
    }
    clear();
    router.push(`/orders/${data.orderId}?placed=1`);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <h1 className="mb-4 border-b border-border-default pb-3 text-2xl font-normal">
        Checkout{" "}
        <span className="text-sm text-text-secondary">
          ({lines.reduce((n, l) => n + l.quantity, 0)} items)
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {/* STEP 1 — address */}
          <Section
            n={1}
            title="Delivery address"
            open={step === 1}
            done={step > 1 && !!selectedAddr}
            summary={
              selectedAddr &&
              `${selectedAddr.fullName}, ${selectedAddr.line1}, ${selectedAddr.city} ${selectedAddr.postal}`
            }
            onChange={() => setStep(1)}
          >
            <div className="space-y-2">
              {addrList.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm ${
                    selectedId === a.id
                      ? "border-border-accent bg-accent-subtle/40"
                      : "border-border-default"
                  }`}
                >
                  <input
                    type="radio"
                    name="addr"
                    checked={selectedId === a.id}
                    onChange={() => setSelectedId(a.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-bold">{a.fullName}</span>
                    {a.isDefault && (
                      <span className="ml-2 rounded bg-subtle px-1.5 py-0.5 text-xs text-text-secondary">
                        Default
                      </span>
                    )}
                    <br />
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal}
                    <br />
                    Phone: {a.phone}
                  </span>
                </label>
              ))}

              {addingAddr ? (
                <div className="rounded-md border border-border-default p-3">
                  <p className="mb-2 text-sm font-bold">Add a new address</p>
                  <AddressFields
                    submitLabel="Use this address"
                    onCancel={
                      addrList.length ? () => setAddingAddr(false) : undefined
                    }
                    onSubmit={async (form) => {
                      const res = await createAddress(form);
                      if (res.ok && res.id) {
                        const draft: Address = {
                          id: res.id,
                          fullName: String(form.get("fullName")),
                          phone: String(form.get("phone")),
                          line1: String(form.get("line1")),
                          line2: (form.get("line2") as string) || null,
                          city: String(form.get("city")),
                          state: String(form.get("state")),
                          postal: String(form.get("postal")),
                          isDefault:
                            form.get("isDefault") === "on" || addrList.length === 0,
                        };
                        setAddrList((l) => [
                          ...l.map((x) =>
                            draft.isDefault ? { ...x, isDefault: false } : x,
                          ),
                          draft,
                        ]);
                        setSelectedId(res.id);
                        setAddingAddr(false);
                      }
                      return res;
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingAddr(true)}
                  className="link text-sm"
                >
                  + Add a new address
                </button>
              )}

              {!addingAddr && (
                <div>
                  <button
                    type="button"
                    onClick={() => selectedAddr && setStep(2)}
                    disabled={!selectedAddr}
                    className="mt-2 rounded-pill bg-accent px-8 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
                  >
                    Deliver to this address
                  </button>
                </div>
              )}
            </div>
          </Section>

          {/* STEP 2 — delivery */}
          <Section
            n={2}
            title="Delivery options"
            open={step === 2}
            done={step > 2}
            summary={
              step > 2
                ? `${DELIVERY_OPTIONS.find((o) => o.id === speed)!.label} · ${deliveryRange(speed)}`
                : undefined
            }
            onChange={() => setStep(2)}
          >
            <div className="space-y-2">
              {DELIVERY_OPTIONS.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm ${
                    speed === o.id
                      ? "border-border-accent bg-accent-subtle/40"
                      : "border-border-default"
                  }`}
                >
                  <input
                    type="radio"
                    name="speed"
                    checked={speed === o.id}
                    onChange={() => setSpeed(o.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-bold">
                      {o.feeCents === 0 ? "FREE" : formatPrice(o.feeCents)}
                    </span>{" "}
                    — {o.label}
                    <br />
                    <span className="text-text-secondary">
                      Arrives {deliveryRange(o.id)}
                    </span>
                  </span>
                </label>
              ))}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="mt-2 rounded-pill bg-accent px-8 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
              >
                Continue to payment
              </button>
            </div>
          </Section>

          {/* STEP 3 — payment */}
          <Section
            n={3}
            title="Payment method"
            open={step === 3}
            done={false}
            onChange={() => setStep(3)}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["card", "Credit or debit card"],
                    ["upi", "UPI"],
                    ["cod", "Cash on Delivery"],
                  ] as [PayMethod, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPay(id)}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      pay === id
                        ? "border-border-accent bg-accent-subtle/40 font-medium"
                        : "border-border-strong"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {pay === "card" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <CardInput
                    label="Card number"
                    span2
                    value={card.number}
                    onChange={(v) => setCard({ ...card, number: v })}
                    placeholder="4242 4242 4242 4242"
                  />
                  <CardInput
                    label="Name on card"
                    span2
                    value={card.name}
                    onChange={(v) => setCard({ ...card, name: v })}
                  />
                  <CardInput
                    label="Expiry (MM/YY)"
                    value={card.exp}
                    onChange={(v) => setCard({ ...card, exp: v })}
                    placeholder="12/28"
                  />
                  <CardInput
                    label="CVV"
                    value={card.cvv}
                    onChange={(v) => setCard({ ...card, cvv: v })}
                    placeholder="123"
                  />
                  <p className="text-xs text-text-secondary sm:col-span-2">
                    Cards are not charged. Use{" "}
                    <code className="rounded bg-subtle px-1">
                      4242 4242 4242 4242
                    </code>{" "}
                    to succeed or a number ending{" "}
                    <code className="rounded bg-subtle px-1">0002</code> to see a
                    decline.
                  </p>
                </div>
              )}

              {pay === "upi" && (
                <div>
                  <CardInput
                    label="UPI ID"
                    value={upiId}
                    onChange={setUpiId}
                    placeholder="name@bank"
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    Any valid-looking ID works; start it with{" "}
                    <code className="rounded bg-subtle px-1">fail@</code> to test a
                    failed request.
                  </p>
                </div>
              )}

              {pay === "cod" && (
                <p className="rounded-md bg-subtle p-3 text-sm text-text-secondary">
                  Pay with cash when your order is delivered. An extra handling
                  fee may apply on real orders.
                </p>
              )}

              {error && (
                <p className="rounded-md bg-danger-subtle p-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={placeOrder}
                disabled={pending || !ready}
                className="w-full rounded-pill bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {pending
                  ? "Placing order…"
                  : error
                    ? "Retry payment & place order"
                    : "Place your order"}
              </button>
            </div>
          </Section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-lg border border-border-default bg-surface p-4">
          <button
            type="button"
            onClick={placeOrder}
            disabled={pending || step < 3 || !ready}
            className="w-full rounded-pill bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50"
          >
            {pending ? "Placing order…" : "Place your order"}
          </button>
          <p className="mt-2 text-xs text-text-secondary">
            By placing your order, you agree to Amazon&apos;s Conditions of Use
            and Privacy Notice.
          </p>

          <h2 className="mt-4 border-t border-border-default pt-3 text-lg font-bold">
            Order Summary
          </h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label={`Items (${lines.length})`} value={formatPrice(listSubtotalCents)} />
            {totals.discountCents > 0 && (
              <Row
                label="Discount"
                value={`−${formatPrice(totals.discountCents)}`}
                accent="text-success"
              />
            )}
            <Row
              label="Delivery"
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

          <ul className="mt-3 space-y-2 border-t border-border-default pt-3">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-2 text-xs">
                <div className="relative h-10 w-10 shrink-0 bg-white">
                  {l.image && (
                    <Image
                      src={l.image}
                      alt={l.title}
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  )}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2">{l.title}</span>
                  <span className="text-text-secondary">
                    Qty {l.quantity} · {formatPrice(l.priceCents * l.quantity)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Section({
  n,
  title,
  open,
  done,
  summary,
  onChange,
  children,
}: {
  n: number;
  title: string;
  open: boolean;
  done: boolean;
  summary?: string | false;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border-default bg-surface">
      <div className="flex items-center gap-2 px-4 py-3">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            done
              ? "bg-success text-white"
              : open
                ? "bg-chrome-nav text-white"
                : "bg-subtle text-text-secondary"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h2 className="flex-1 text-lg font-bold">{title}</h2>
        {done && (
          <button type="button" onClick={onChange} className="link text-sm">
            Change
          </button>
        )}
      </div>
      {open && <div className="border-t border-border-default p-4">{children}</div>}
      {!open && summary && (
        <p className="px-4 pb-3 pl-12 text-sm text-text-secondary">{summary}</p>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: string;
}) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold" : ""}`}>
      <dt>{label}</dt>
      <dd className={accent}>{value}</dd>
    </div>
  );
}

function CardInput({
  label,
  value,
  onChange,
  placeholder,
  span2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  span2?: boolean;
}) {
  return (
    <label className={`block text-sm font-bold ${span2 ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-border-strong px-2 py-1.5 text-sm font-normal focus:border-border-accent focus:outline-none"
      />
    </label>
  );
}
