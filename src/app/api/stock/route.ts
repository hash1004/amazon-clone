import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Live stock for the given product ids: GET /api/stock?ids=a,b → { stock: { a: 3, b: 0 } }. */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
  if (ids.length === 0) return NextResponse.json({ stock: {} });

  const rows = await db.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, stock: true },
  });
  const stock: Record<string, number> = {};
  for (const id of ids) stock[id] = 0; // unknown id → treat as gone
  for (const r of rows) stock[r.id] = r.stock;

  return NextResponse.json({ stock }, { headers: { "Cache-Control": "no-store" } });
}
