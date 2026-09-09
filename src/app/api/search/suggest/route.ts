import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEPARTMENT_BY_SLUG, DEPARTMENTS } from "@/lib/departments";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const dept = url.searchParams.get("dept") ?? "";

  if (q.length < 2) {
    return NextResponse.json({ products: [], brands: [] });
  }

  const where = {
    ...(dept && DEPARTMENT_BY_SLUG[dept] ? { department: dept } : {}),
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { brand: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const [products, brandRows] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { ratingCount: "desc" },
      take: 7,
      select: { slug: true, title: true, images: true, department: true },
    }),
    db.product.groupBy({
      by: ["brand"],
      where: {
        ...(dept && DEPARTMENT_BY_SLUG[dept] ? { department: dept } : {}),
        brand: { contains: q, mode: "insensitive" as const },
      },
      _count: { brand: true },
      orderBy: { _count: { brand: "desc" } },
      take: 3,
    }),
  ]);

  const departments = DEPARTMENTS.filter((d) =>
    d.label.toLowerCase().includes(q.toLowerCase()),
  )
    .slice(0, 2)
    .map((d) => ({ slug: d.slug, label: d.label }));

  return NextResponse.json({
    departments,
    brands: brandRows.map((b) => b.brand),
    products: products.map((p) => ({
      slug: p.slug,
      title: p.title,
      image: p.images[0] ?? "",
      department: p.department,
    })),
  });
}
