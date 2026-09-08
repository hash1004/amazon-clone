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

  // Deterministic pseudo-random in [0,1) from an integer seed.
  const rand = (n: number) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  let created = 0;
  for (const p of products) {
    const department = DEPT_MAP[p.category] ?? "everything-else";
    const priceCents = Math.round(p.price * 100);
    const listPriceCents =
      p.discountPercentage > 0
        ? Math.round(priceCents / (1 - p.discountPercentage / 100))
        : null;
    const images = (p.images?.length ? p.images : [p.thumbnail]).filter(Boolean);

    const firstSentence =
      p.description.split(/(?<=[.!?])\s/)[0] ?? p.description;
    const prettyCategory = p.category
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const ratingCount = Math.round(
      p.rating ** 2 * 40 + rand(p.id) * 2600 + 15,
    );

    await db.product.create({
      data: {
        slug: `${slugify(p.title)}-${p.id}`,
        title: p.title,
        description: p.description,
        brand: p.brand?.trim() || "Generic",
        department,
        bullets: [
          firstSentence,
          `${p.brand?.trim() || "Quality"} ${prettyCategory.toLowerCase()} — genuine, brand-new stock`,
          `Rated ${p.rating.toFixed(1)} out of 5 by ${ratingCount.toLocaleString()} customers`,
          listPriceCents
            ? `Now ${p.discountPercentage.toFixed(0)}% off the list price`
            : `Everyday low price`,
          `Ships from and sold by the Amazon clone warehouse`,
        ],
        images,
        priceCents,
        listPriceCents,
        rating: Math.round(p.rating * 10) / 10,
        ratingCount,
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
