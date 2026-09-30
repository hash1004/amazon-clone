import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchProducts } from "@/lib/product-search";

const ROAST_LEVELS = [
  { slug: "light", label: "Light roasts" },
  { slug: "medium", label: "Medium roasts" },
  { slug: "dark", label: "Dark roasts" },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ products: [], origins: [], roastLevels: [] });
  }

  // Same relevance search as the results page, so a suggestion never
  // promises something the results page then can't find.
  const catalog = await db.product.findMany({
    orderBy: { ratingCount: "desc" },
    select: {
      slug: true,
      title: true,
      images: true,
      origin: true,
      process: true,
      roastLevel: true,
      tastingNotes: true,
      description: true,
    },
  });
  const hits = searchProducts(catalog, q);

  // Suggest an origin / roast level only when the query actually hit that
  // field, not just because a matching product happens to have one.
  const origins = [
    ...new Set(hits.filter((h) => h.fields.has("origin")).map((h) => h.product.origin)),
  ].slice(0, 3);
  const roastSlugs = new Set(
    hits.filter((h) => h.fields.has("roast")).map((h) => h.product.roastLevel.toLowerCase()),
  );
  const roastLevels = ROAST_LEVELS.filter((r) => roastSlugs.has(r.slug)).slice(0, 2);

  return NextResponse.json({
    roastLevels,
    origins,
    products: hits.slice(0, 7).map(({ product: p }) => ({
      slug: p.slug,
      title: p.title,
      image: p.images[0] ?? "",
    })),
  });
}
