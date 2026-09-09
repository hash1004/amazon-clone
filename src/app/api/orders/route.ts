import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { orderTotals } from "@/lib/pricing";
import { estimateDelivery } from "@/lib/delivery";

type IncomingItem = { productId: string; quantity: number };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
  const items = rawItems
    .map((i) => ({
      productId: String(i.productId),
      quantity: Math.max(1, Math.min(99, Math.floor(Number(i.quantity) || 0))),
    }))
    .filter((i) => i.productId);

  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // ── Address: saved id or inline ────────────────────────────────
  let ship: {
    name: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal: string;
  } | null = null;

  if (body.addressId) {
    const a = await db.address.findFirst({
      where: { id: String(body.addressId), userId: session.user.id },
    });
    if (!a)
      return NextResponse.json(
        { error: "Select a delivery address." },
        { status: 400 },
      );
    ship = {
      name: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      postal: a.postal,
    };
  } else {
    const s = (body.shipping ?? {}) as Record<string, unknown>;
    const g = (k: string) => String(s[k] ?? "").trim();
    ship = {
      name: g("name"),
      phone: g("phone"),
      line1: g("line1"),
      line2: g("line2") || null,
      city: g("city"),
      state: g("state"),
      postal: g("postal"),
    };
    if (!ship.name || !ship.line1 || !ship.city || !ship.state || !ship.postal) {
      return NextResponse.json(
        { error: "Complete the delivery address." },
        { status: 400 },
      );
    }
  }

  const deliverySpeed = body.deliverySpeed === "express" ? "express" : "standard";
  const paymentMethod = ["card", "upi", "cod"].includes(String(body.paymentMethod))
    ? String(body.paymentMethod)
    : "card";

  // ── Mock payment ───────────────────────────────────────────────
  let paymentLast4 = "";
  if (paymentMethod === "card") {
    const digits = String(body.cardNumber ?? "").replace(/\D/g, "");
    if (digits.length < 15) {
      return NextResponse.json(
        { error: "Enter a valid card number." },
        { status: 400 },
      );
    }
    // Test decline card, mirrors Stripe's 4000 0000 0000 0002
    if (digits.endsWith("0002")) {
      return NextResponse.json(
        {
          error:
            "Your card was declined. Please try a different card or payment method.",
          code: "payment_declined",
        },
        { status: 402 },
      );
    }
    paymentLast4 = digits.slice(-4);
  } else if (paymentMethod === "upi") {
    const upi = String(body.upiId ?? "").trim();
    if (!/^[\w.\-]{2,}@[a-z]{2,}$/i.test(upi)) {
      return NextResponse.json(
        { error: "Enter a valid UPI ID (name@bank)." },
        { status: 400 },
      );
    }
    if (upi.startsWith("fail@")) {
      return NextResponse.json(
        { error: "The UPI payment request failed. Please retry.", code: "payment_declined" },
        { status: 402 },
      );
    }
  }

  // ── Authoritative prices from the DB ──────────────────────────
  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lineItems = items
    .filter((i) => byId.has(i.productId))
    .map((i) => {
      const p = byId.get(i.productId)!;
      return {
        productId: p.id,
        titleSnapshot: p.title,
        priceCentsSnapshot: p.priceCents,
        imageSnapshot: p.images[0] ?? "",
        quantity: i.quantity,
        _list: p.listPriceCents ?? p.priceCents,
      };
    });

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "These items are no longer available." },
      { status: 400 },
    );
  }

  const subtotalCents = lineItems.reduce(
    (n, li) => n + li.priceCentsSnapshot * li.quantity,
    0,
  );
  const listSubtotalCents = lineItems.reduce(
    (n, li) => n + li._list * li.quantity,
    0,
  );
  const totals = orderTotals(subtotalCents, { deliverySpeed, listSubtotalCents });

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      status: "CONFIRMED",
      subtotalCents: totals.subtotalCents,
      discountCents: totals.discountCents,
      shippingCents: totals.shippingCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      deliverySpeed,
      paymentMethod,
      estimatedDelivery: estimateDelivery(deliverySpeed),
      shipName: ship.name,
      shipPhone: ship.phone,
      shipLine1: ship.line1,
      shipLine2: ship.line2,
      shipCity: ship.city,
      shipState: ship.state,
      shipPostal: ship.postal,
      shipCountry: "US",
      paymentLast4,
      items: {
        create: lineItems.map((li) => ({
          productId: li.productId,
          titleSnapshot: li.titleSnapshot,
          priceCentsSnapshot: li.priceCentsSnapshot,
          imageSnapshot: li.imageSnapshot,
          quantity: li.quantity,
        })),
      },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
