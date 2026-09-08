import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { orderTotals } from "@/lib/pricing";

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

  const ship = (body.shipping ?? {}) as Record<string, unknown>;
  const shipName = String(ship.name ?? "").trim();
  const shipLine1 = String(ship.line1 ?? "").trim();
  const shipCity = String(ship.city ?? "").trim();
  const shipState = String(ship.state ?? "").trim();
  const shipPostal = String(ship.postal ?? "").trim();
  if (!shipName || !shipLine1 || !shipCity || !shipState || !shipPostal) {
    return NextResponse.json(
      { error: "Complete the shipping address." },
      { status: 400 },
    );
  }

  const cardLast4 = String(body.cardLast4 ?? "").replace(/\D/g, "").slice(-4);
  if (cardLast4.length !== 4) {
    return NextResponse.json(
      { error: "Enter a valid card number." },
      { status: 400 },
    );
  }

  // Authoritative prices come from the DB, never the client.
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
  const totals = orderTotals(subtotalCents);

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      status: "PAID", // mock payment always succeeds
      ...totals,
      shipName,
      shipLine1,
      shipLine2: String(ship.line2 ?? "").trim() || null,
      shipCity,
      shipState,
      shipPostal,
      shipCountry: "US",
      paymentLast4: cardLast4,
      items: { create: lineItems },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
