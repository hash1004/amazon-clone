import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { validateAddress } from "@/lib/field-rules";
import { orderTotals } from "@/lib/pricing";
import { estimateDelivery } from "@/lib/delivery";
import { checkoutTestMode } from "@/lib/checkout-mode";
import { DECLINE_SUFFIX, TEST_CARD_NUMBERS } from "@/lib/test-cards";
import {
  DEFAULT_GRIND,
  DEFAULT_SIZE,
  isGrind,
  isSize,
  variantFor,
} from "@/lib/variants";

type IncomingItem = { productId: string; quantity: number; grind?: string; size?: string };

class OutOfStock extends Error {
  constructor(
    readonly title: string,
    readonly left: number,
  ) {
    super(`Out of stock: ${title}`);
  }
}

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
      grind: isGrind(i.grind) ? i.grind : DEFAULT_GRIND,
      size: isSize(i.size) ? i.size : DEFAULT_SIZE,
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
    const problem = Object.values(
      validateAddress({ ...ship, fullName: ship.name }),
    )[0];
    if (problem) {
      return NextResponse.json({ error: `Delivery address: ${problem}` }, { status: 400 });
    }
  }

  const deliverySpeed = body.deliverySpeed === "express" ? "express" : "standard";
  // US store: cards only.
  const paymentMethod = "card";

  // ── Mock payment ───────────────────────────────────────────────
  const digits = String(body.cardNumber ?? "").replace(/\D/g, "");
  if (digits.length < 15) {
    return NextResponse.json({ error: "Enter a valid card number." }, { status: 400 });
  }
  if (checkoutTestMode()) {
    // Test decline card, mirrors Stripe's 4000 0000 0000 0002
    if (digits.endsWith(DECLINE_SUFFIX)) {
      return NextResponse.json(
        {
          error: "Your card was declined. Try a different card.",
          code: "payment_declined",
        },
        { status: 402 },
      );
    }
  } else if (TEST_CARD_NUMBERS.has(digits)) {
    return NextResponse.json(
      { error: "Test cards can't be used for real orders.", code: "payment_declined" },
      { status: 402 },
    );
  }
  const paymentLast4 = digits.slice(-4);

  // ── Authoritative prices from the DB ──────────────────────────
  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Price comes from the size the customer chose, computed here from the
  // catalog — never from what the browser sent.
  const lineItems = items
    .filter((i) => byId.has(i.productId))
    .map((i) => {
      const p = byId.get(i.productId)!;
      const v = variantFor(p, i.size);
      return {
        productId: p.id,
        titleSnapshot: p.title,
        priceCentsSnapshot: v.priceCents,
        imageSnapshot: p.images[0] ?? "",
        quantity: i.quantity,
        grind: i.grind,
        size: i.size,
        grams: v.grams,
        _list: v.listPriceCents ?? v.priceCents,
        _units: v.units * i.quantity,
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

  // Stock is counted in standard bags; one coffee can be on several lines
  // (different grinds/sizes), so take it per coffee, not per line.
  const unitsByProduct = new Map<string, { units: number; title: string }>();
  for (const li of lineItems) {
    const cur = unitsByProduct.get(li.productId);
    unitsByProduct.set(li.productId, {
      units: (cur?.units ?? 0) + li._units,
      title: li.titleSnapshot,
    });
  }

  // Take the stock and create the order in one transaction: each coffee only
  // decrements if that much is still there, so two shoppers can't both buy
  // the last bag. Any shortfall rolls the whole order back.
  let order: { id: string };
  try {
    order = await db.$transaction(async (tx) => {
      for (const [productId, { units, title }] of unitsByProduct) {
        const taken = await tx.product.updateMany({
          where: { id: productId, stock: { gte: units } },
          data: { stock: { decrement: units } },
        });
        if (taken.count === 0) {
          const left =
            (await tx.product.findUnique({ where: { id: productId }, select: { stock: true } }))
              ?.stock ?? 0;
          throw new OutOfStock(title, left);
        }
      }

      return tx.order.create({
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
              grind: li.grind,
              size: li.size,
              grams: li.grams,
            })),
          },
        },
      });
    });
  } catch (e) {
    if (e instanceof OutOfStock) {
      const error =
        e.left > 0
          ? `Not enough ${e.title} left for this order (${e.left} standard ${e.left === 1 ? "bag" : "bags"}). Lower the quantity in your cart and try again.`
          : `${e.title} just sold out. Remove it from your cart to continue.`;
      return NextResponse.json({ error, code: "out_of_stock" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ orderId: order.id });
}
