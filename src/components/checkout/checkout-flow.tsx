"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { lineKey, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { orderTotals } from "@/lib/pricing";
import { DELIVERY_OPTIONS, deliveryRange, type DeliverySpeed } from "@/lib/delivery";
import { createAddress } from "@/lib/address-actions";
import { AddressFields } from "@/components/checkout/address-form";
import { sanitize } from "@/lib/field-rules";
import { variantSummary } from "@/lib/variants";
import { DECLINE_SUFFIX, TEST_CARD, testCardExpiry } from "@/lib/test-cards";
import {
  formatCardNumber,
  formatExpiry,
  formatCvv,
  validateCard,
  type CardFields,
} from "@/lib/payment";

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

const STEPS = ["Address", "Delivery", "Payment"] as const;

export function CheckoutFlow({
  addresses,
  testMode,
}: {
  addresses: Address[];
  /** Payments are mocked: show the test-mode banner and "Fill test card". */
  testMode: boolean;
}) {
  const { lines, count, subtotalCents, ready, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [addrList, setAddrList] = useState(addresses);
  const [selectedId, setSelectedId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [addingAddr, setAddingAddr] = useState(addresses.length === 0);
  const [speed, setSpeed] = useState<DeliverySpeed>("standard");
  const [card, setCard] = useState<CardFields>({ number: "", name: "", exp: "", cvv: "" });
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardFields, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const totals = orderTotals(subtotalCents, { deliverySpeed: speed });
  const selectedAddr = addrList.find((a) => a.id === selectedId);
  const bags = `${count} ${count === 1 ? "bag" : "bags"}`;

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

  const editCard = (k: keyof CardFields, v: string) => {
    setCard((c) => ({ ...c, [k]: v }));
    setCardErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function placeOrder() {
    setError(null);
    if (!selectedAddr) {
      setError("Add a delivery address to continue.");
      setStep(1);
      return;
    }

    const errs = validateCard(card);
    setCardErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStep(3);
      setError("Check the card details below.");
      return;
    }

    setPending(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          grind: l.grind,
          size: l.size,
        })),
        addressId: selectedAddr.id,
        deliverySpeed: speed,
        paymentMethod: "card",
        cardNumber: card.number,
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
      <h1 className="font-serif text-2xl font-medium text-text-primary">
        Checkout{" "}
        <span className="font-sans text-sm text-text-secondary">({bags})</span>
      </h1>

      <ol className="mb-5 mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" aria-label="Checkout steps">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "current" : "todo";
          return (
            <li key={label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="h-px w-6 bg-border-strong" />}
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={
                  state === "current"
                    ? "font-semibold text-text-primary"
                    : state === "done"
                      ? "text-success"
                      : "text-text-secondary"
                }
              >
                {state === "done" && <span aria-hidden>✓ </span>}
                {label}
                {state === "done" && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-3">
          {/* STEP 1 — address */}
          <Section
            n={1}
            title="Delivery address"
            open={step === 1}
            done={step > 1 && !!selectedAddr}
            summary={
              selectedAddr &&
              `${selectedAddr.fullName}, ${selectedAddr.line1}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.postal}`
            }
            onChange={() => setStep(1)}
          >
            <div className="space-y-2">
              {addrList.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer gap-3 border p-3 text-sm ${
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
                      <span className="ml-2 bg-subtle px-1.5 py-0.5 text-xs text-text-secondary">
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
                <div className="border border-border-default p-3">
                  <p className="mb-2 text-sm font-bold">Add a new address</p>
                  <AddressFields
                    submitLabel="Use this address"
                    onCancel={addrList.length ? () => setAddingAddr(false) : undefined}
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
                          isDefault: form.get("isDefault") === "on" || addrList.length === 0,
                        };
                        setAddrList((l) => [
                          ...l.map((x) => (draft.isDefault ? { ...x, isDefault: false } : x)),
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
                <button type="button" onClick={() => setAddingAddr(true)} className="link text-sm">
                  + Add a new address
                </button>
              )}

              {!addingAddr && (
                <div>
                  <button
                    type="button"
                    onClick={() => selectedAddr && setStep(2)}
                    disabled={!selectedAddr}
                    className="mt-2 rounded-control bg-accent px-8 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
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
            <fieldset className="space-y-2">
              <legend className="sr-only">Delivery speed</legend>
              {DELIVERY_OPTIONS.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-start gap-3 border p-3 text-sm ${
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
                      {o.feeCents === 0 ? "Free" : formatPrice(o.feeCents)}
                    </span>{" "}
                    — {o.label}
                    <br />
                    <span className="text-text-secondary">Arrives {deliveryRange(o.id)}</span>
                  </span>
                </label>
              ))}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="mt-2 rounded-control bg-accent px-8 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
              >
                Continue to payment
              </button>
            </fieldset>
          </Section>

          {/* STEP 3 — payment */}
          <Section n={3} title="Payment" open={step === 3} done={false} onChange={() => setStep(3)}>
            <div className="min-w-0 space-y-3">
              {testMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 border border-warning bg-warning-subtle p-3 text-sm">
                  <p className="text-text-primary">
                    <span className="font-semibold text-warning">Test mode.</span> No card is
                    charged. A card number ending in {DECLINE_SUFFIX} shows a decline.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCard({
                        number: TEST_CARD.number,
                        name: TEST_CARD.name,
                        exp: testCardExpiry(),
                        cvv: TEST_CARD.cvv,
                      });
                      setCardErrors({});
                      setError(null);
                    }}
                    className="rounded-control border border-border-strong bg-surface px-3 py-1 text-xs font-medium hover:bg-subtle"
                  >
                    Fill test card
                  </button>
                </div>
              )}

              <p className="text-sm text-text-secondary">Credit or debit card</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <CardInput
                  label="Card number"
                  span2
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={card.number}
                  error={cardErrors.number}
                  onChange={(v) => editCard("number", formatCardNumber(v))}
                />
                <CardInput
                  label="Name on card"
                  span2
                  autoComplete="cc-name"
                  value={card.name}
                  error={cardErrors.name}
                  onChange={(v) => editCard("name", sanitize.name(v))}
                />
                <CardInput
                  label="Expiry (MM/YY)"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={card.exp}
                  error={cardErrors.exp}
                  onChange={(v) => editCard("exp", formatExpiry(v))}
                />
                <CardInput
                  label="Security code"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={card.cvv}
                  error={cardErrors.cvv}
                  onChange={(v) => editCard("cvv", formatCvv(v))}
                />
              </div>

              {error && (
                <p role="alert" className="bg-danger-subtle p-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={placeOrder}
                disabled={pending || !ready}
                className="w-full rounded-control bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {pending
                  ? "Placing order…"
                  : `${error ? "Try again" : "Place your order"} · ${formatPrice(totals.totalCents)}`}
              </button>
              <p className="text-xs text-text-secondary">
                By placing your order you agree to our{" "}
                <Link href="/info/conditions-of-use" className="link">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/info/privacy-notice" className="link">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </Section>
        </div>

        {/* Summary — totals only; the one Place order button is in step 3. */}
        <aside className="h-fit border border-border-default bg-surface p-4">
          <h2 className="font-serif text-lg font-medium">Order summary</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label={`Items (${bags})`} value={formatPrice(subtotalCents)} />
            <Row
              label="Delivery"
              value={totals.shippingCents === 0 ? "Free" : formatPrice(totals.shippingCents)}
            />
            <Row label="Estimated tax" value={formatPrice(totals.taxCents)} />
            <div className="border-t border-border-default pt-1">
              <Row label="Order total" value={formatPrice(totals.totalCents)} bold />
            </div>
          </dl>

          <ul className="mt-3 space-y-2 border-t border-border-default pt-3">
            {lines.map((l) => (
              <li key={lineKey(l)} className="flex gap-2 text-xs">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-subtle">
                  {l.image && <Image src={l.image} alt="" fill sizes="40px" className="object-cover" />}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2">{l.title}</span>
                  <span className="block text-text-secondary">{variantSummary(l.grind, l.grams)}</span>
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
    <section className="border border-border-default bg-surface">
      <div className="flex items-center gap-2 px-4 py-3">
        <span
          aria-hidden
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            done
              ? "bg-success text-text-inverse"
              : open
                ? "bg-accent text-accent-fg"
                : "bg-subtle text-text-secondary"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h2 className="flex-1 font-serif text-lg font-medium">
          <span className="sr-only">
            Step {n} of {STEPS.length}:{" "}
          </span>
          {title}
        </h2>
        {done && (
          <button type="button" onClick={onChange} className="link text-sm">
            Change<span className="sr-only"> {title.toLowerCase()}</span>
          </button>
        )}
      </div>
      {open && <div className="border-t border-border-default p-4">{children}</div>}
      {!open && summary && <p className="px-4 pb-3 pl-12 text-sm text-text-secondary">{summary}</p>}
    </section>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function CardInput({
  label,
  value,
  onChange,
  span2,
  error,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  span2?: boolean;
  error?: string;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
}) {
  return (
    <label className={`block text-sm font-bold ${span2 ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={`mt-1 w-full border px-2 py-1.5 text-sm font-normal focus:outline-none ${
          error ? "border-danger focus:border-danger" : "border-border-strong focus:border-border-accent"
        }`}
      />
      {error && <span className="mt-0.5 block text-xs font-normal text-danger">{error}</span>}
    </label>
  );
}
