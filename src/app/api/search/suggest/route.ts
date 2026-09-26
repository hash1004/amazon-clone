import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ROAST_LEVELS = [
  { slug: "light", label: "Light Roasts" },
  { slug: "medium", label: "Medium Roasts" },
  { slug: "dark", label: "Dark Roasts" },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ products: [], origins: [], roastLevels: [] });
  }

  const where = {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { origin: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const [products, originRows] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { ratingCount: "desc" },
      take: 7,
      select: { slug: true, title: true, images: true },
    }),
    db.product.groupBy({
      by: ["origin"],
      where: { origin: { contains: q, mode: "insensitive" as const } },
      _count: { origin: true },
      orderBy: { _count: { origin: "desc" } },
      take: 3,
    }),
  ]);

  const roastLevels = ROAST_LEVELS.filter((r) =>
    r.label.toLowerCase().includes(q.toLowerCase()),
  ).slice(0, 2);

  return NextResponse.json({
    roastLevels,
    origins: originRows.map((o) => o.origin),
    products: products.map((p) => ({
      slug: p.slug,
      title: p.title,
      image: p.images[0] ?? "",
    })),
  });
}
