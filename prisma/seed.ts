import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// DummyJSON category -> our department
const DEPT_MAP: Record<string, string> = {
  laptops: "electronics",
  smartphones: "electronics",
  tablets: "electronics",
  "mobile-accessories": "electronics",
  "mens-watches": "electronics",
  "womens-watches": "electronics",
  furniture: "home-kitchen",
  "home-decoration": "home-kitchen",
  "kitchen-accessories": "home-kitchen",
  groceries: "home-kitchen",
  beauty: "beauty",
  fragrances: "beauty",
  "skin-care": "beauty",
  "mens-shirts": "fashion",
  "mens-shoes": "fashion",
  tops: "fashion",
  "womens-dresses": "fashion",
  "womens-shoes": "fashion",
  "womens-bags": "fashion",
  "womens-jewellery": "fashion",
  sunglasses: "fashion",
  "sports-accessories": "sports-outdoors",
  motorcycle: "sports-outdoors",
  vehicle: "sports-outdoors",
};

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  images: string[];
  thumbnail: string;
  tags: string[];
  reviews: { rating: number }[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Fetching products from dummyjson.com …");
  const res = await fetch(
    "https://dummyjson.com/products?limit=0&select=title,description,category,price,discountPercentage,rating,stock,brand,images,thumbnail,tags,reviews",
  );
  const { products } = (await res.json()) as { products: DummyProduct[] };
  console.log(`Got ${products.length} products.`);

  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.product.deleteMany();

  let created = 0;
  for (const p of products) {
    const department = DEPT_MAP[p.category] ?? "everything-else";
    const priceCents = Math.round(p.price * 100);
    const listPriceCents =
      p.discountPercentage > 0
        ? Math.round(priceCents / (1 - p.discountPercentage / 100))
        : null;
    const images = (p.images?.length ? p.images : [p.thumbnail]).filter(Boolean);

    await db.product.create({
      data: {
        slug: `${slugify(p.title)}-${p.id}`,
        title: p.title,
        description: p.description,
        brand: p.brand?.trim() || "Generic",
        department,
        bullets: [
          ...p.tags.map((t) => `Category: ${t}`),
          `Ships from the Amazon clone warehouse`,
          `${p.stock} in stock`,
        ],
        images,
        priceCents,
        listPriceCents,
        rating: Math.round(p.rating * 10) / 10,
        ratingCount: p.reviews?.length
          ? p.reviews.length * 37 + p.id
          : 10 + (p.id % 90),
        stock: p.stock,
        featured: p.rating >= 4.5,
      },
    });
    created++;
  }

  const byDept = await db.product.groupBy({
    by: ["department"],
    _count: true,
  });
  console.log(`Seeded ${created} products:`);
  for (const d of byDept) console.log(`  ${d.department}: ${d._count}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
