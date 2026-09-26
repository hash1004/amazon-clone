import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
}

// Real, license-clean Unsplash photography, verified live before use.
const img = {
  beansDark: unsplash("1447933601403-0c6688de566e"),
  beansLight: unsplash("1580933073521-dc49ac0d4e6a"),
  beansSack: unsplash("1524350876685-274059332603"),
  beansPile: unsplash("1442550528053-c431ecb55509"),
  cupOnBeans: unsplash("1509042239860-f550ce710b93"),
  cupSteamDark: unsplash("1497515114629-f71d768fd07c"),
  flyingBeans: unsplash("1610632380989-680fe40816c6"),
  groundAndBeans: unsplash("1509785307050-d4066910ec1e"),
  latteOnBeans: unsplash("1512568400610-62da28bc8a13"),
  latteOnStool: unsplash("1497636577773-f1231844b336"),
  portafilter: unsplash("1497935586351-b67a49e012bf"),
  extraction: unsplash("1522992319-0365e5f11656"),
  chemex: unsplash("1442512595331-e89e73853f31"),
  milkPour: unsplash("1541167760496-1628856ab772"),
  handsClose: unsplash("1495774856032-8b90bbb32b32"),
  spoonTable: unsplash("1503481766315-7a586b20f66d"),
  clinkingLattes: unsplash("1495474472287-4d71bcdd2085"),
  moodyHold: unsplash("1520903920243-00d872a2d1c9"),
  outdoorHold: unsplash("1518057111178-44a106bad636"),
  icedGlass: unsplash("1461023058943-07fcbe16d735"),
  icedMason: unsplash("1517701604599-bb29b565090c"),
  shopInterior: unsplash("1493857671505-72967e2e2760"),
  frenchPressWindow: unsplash("1445116572660-236099ec97a0"),
};

type Roast = "LIGHT" | "MEDIUM" | "DARK";

type Coffee = {
  title: string;
  origin: string;
  process: string;
  roastLevel: Roast;
  tastingNotes: string[];
  description: string;
  priceCents: number;
  listPriceCents?: number;
  weightGrams: number;
  rating: number;
  ratingCount: number;
  stock: number;
  featured?: boolean;
  images: string[];
};

const COFFEES: Coffee[] = [
  {
    title: "Ethiopia Yirgacheffe",
    origin: "Ethiopia",
    process: "Washed",
    roastLevel: "LIGHT",
    tastingNotes: ["Jasmine", "Bergamot", "Peach"],
    description:
      "A washed lot from the Yirgacheffe highlands, roasted light to keep its floral top notes intact. Steeps closer to tea than coffee — bergamot and stone fruit up front, a clean jasmine finish.",
    priceCents: 1900,
    weightGrams: 340,
    rating: 4.8,
    ratingCount: 612,
    stock: 64,
    featured: true,
    images: [img.beansLight, img.chemex],
  },
  {
    title: "Kenya Nyeri AA",
    origin: "Kenya",
    process: "Washed",
    roastLevel: "LIGHT",
    tastingNotes: ["Blackcurrant", "Tomato", "Wine"],
    description:
      "High-grown AA-grade beans from the Nyeri hills. Bright, winey acidity with the savory tomato note Kenyan lots are known for, and a blackcurrant sweetness underneath.",
    priceCents: 2100,
    weightGrams: 340,
    rating: 4.7,
    ratingCount: 388,
    stock: 47,
    images: [img.beansPile, img.handsClose],
  },
  {
    title: "Colombia Pink Bourbon",
    origin: "Colombia",
    process: "Washed",
    roastLevel: "LIGHT",
    tastingNotes: ["Strawberry", "Brown Sugar", "Apple"],
    description:
      "A rare pink bourbon varietal from smallholder farms in Huila. Delicate strawberry and apple sweetness with a brown-sugar body — a favorite among our light-roast regulars.",
    priceCents: 1800,
    listPriceCents: 2100,
    weightGrams: 340,
    rating: 4.9,
    ratingCount: 274,
    stock: 38,
    featured: true,
    images: [img.cupOnBeans, img.spoonTable],
  },
  {
    title: "Ethiopia Guji Natural",
    origin: "Ethiopia",
    process: "Natural",
    roastLevel: "LIGHT",
    tastingNotes: ["Blueberry", "Wine", "Dark Chocolate"],
    description:
      "Sun-dried on raised beds in Guji, this natural-process lot ferments its way to an unmistakable blueberry-and-wine character, balanced by a cocoa finish.",
    priceCents: 2000,
    weightGrams: 340,
    rating: 4.6,
    ratingCount: 201,
    stock: 29,
    images: [img.cupSteamDark, img.clinkingLattes],
  },
  {
    title: "Guatemala Huehuetenango",
    origin: "Guatemala",
    process: "Washed",
    roastLevel: "MEDIUM",
    tastingNotes: ["Milk Chocolate", "Orange", "Almond"],
    description:
      "Grown at altitude in the Cuchumatanes mountains, this washed lot is our house crowd-pleaser: milk chocolate and toasted almond with a bright citrus lift.",
    priceCents: 1700,
    weightGrams: 340,
    rating: 4.7,
    ratingCount: 543,
    stock: 71,
    images: [img.portafilter, img.milkPour],
  },
  {
    title: "Costa Rica Tarrazú",
    origin: "Costa Rica",
    process: "Honey",
    roastLevel: "MEDIUM",
    tastingNotes: ["Caramel", "Red Apple", "Honey"],
    description:
      "Honey-processed in the Tarrazú valley, drying with some of the fruit's mucilage still on the parchment for a rounder, honeyed sweetness alongside crisp red apple.",
    priceCents: 1900,
    weightGrams: 340,
    rating: 4.6,
    ratingCount: 165,
    stock: 33,
    images: [img.groundAndBeans, img.moodyHold],
  },
  {
    title: "Colombia Supremo",
    origin: "Colombia",
    process: "Washed",
    roastLevel: "MEDIUM",
    tastingNotes: ["Caramel", "Walnut", "Citrus"],
    description:
      "A dependable, balanced Supremo grade: walnut and caramel through the body, a soft citrus edge at the finish. Our best-selling everyday bag.",
    priceCents: 1500,
    listPriceCents: 1800,
    weightGrams: 454,
    rating: 4.5,
    ratingCount: 897,
    stock: 92,
    featured: true,
    images: [img.latteOnBeans, img.outdoorHold],
  },
  {
    title: "Honduras Marcala",
    origin: "Honduras",
    process: "Washed",
    roastLevel: "MEDIUM",
    tastingNotes: ["Brown Sugar", "Plum", "Almond"],
    description:
      "From the Marcala highlands, a gentle medium roast that leans into stone fruit and brown sugar, with a nutty almond finish that holds up well with milk.",
    priceCents: 1600,
    weightGrams: 340,
    rating: 4.4,
    ratingCount: 142,
    stock: 40,
    images: [img.latteOnStool, img.icedGlass],
  },
  {
    title: "Brazil Cerrado",
    origin: "Brazil",
    process: "Natural",
    roastLevel: "MEDIUM",
    tastingNotes: ["Hazelnut", "Milk Chocolate", "Low Acidity"],
    description:
      "Low-acid and nutty by design — a natural-process Cerrado lot roasted for body over brightness. Our house drip and cold-brew base.",
    priceCents: 1400,
    weightGrams: 454,
    rating: 4.5,
    ratingCount: 356,
    stock: 58,
    images: [img.beansSack, img.icedMason],
  },
  {
    title: "Sumatra Mandheling",
    origin: "Indonesia",
    process: "Wet-Hulled",
    roastLevel: "DARK",
    tastingNotes: ["Cedar", "Dark Chocolate", "Earthy"],
    description:
      "Wet-hulled the traditional Sumatran way, then roasted dark. Heavy body, low acidity, cedar and dark chocolate with the earthy depth the process is known for.",
    priceCents: 1800,
    weightGrams: 340,
    rating: 4.5,
    ratingCount: 231,
    stock: 26,
    images: [img.beansDark, img.shopInterior],
  },
  {
    title: "House Espresso Blend",
    origin: "Blend (Brazil, Sumatra)",
    process: "Blend",
    roastLevel: "DARK",
    tastingNotes: ["Cocoa", "Molasses", "Low Acidity"],
    description:
      "Built for the espresso machine: Brazil for body, Sumatra for depth. Pulls a thick, syrupy shot — cocoa and molasses, barely any acidity to fight through.",
    priceCents: 1600,
    listPriceCents: 1900,
    weightGrams: 454,
    rating: 4.7,
    ratingCount: 429,
    stock: 55,
    featured: true,
    images: [img.flyingBeans, img.extraction],
  },
  {
    title: "French Roast",
    origin: "Blend",
    process: "Blend",
    roastLevel: "DARK",
    tastingNotes: ["Smoke", "Dark Chocolate", "Bittersweet"],
    description:
      "Pushed right to the edge of the roast — smoky, bittersweet, dark chocolate through and through. For the drinkers who take it black, no exceptions.",
    priceCents: 1500,
    weightGrams: 340,
    rating: 4.3,
    ratingCount: 118,
    stock: 34,
    images: [img.extraction, img.frenchPressWindow],
  },
];

async function main() {
  console.log(`Seeding ${COFFEES.length} coffees…`);

  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.product.deleteMany();

  for (const c of COFFEES) {
    await db.product.create({
      data: {
        slug: slugify(c.title),
        title: c.title,
        description: c.description,
        origin: c.origin,
        process: c.process,
        roastLevel: c.roastLevel,
        tastingNotes: c.tastingNotes,
        weightGrams: c.weightGrams,
        bullets: [
          `${c.origin} · ${c.process} process · ${c.roastLevel.charAt(0)}${c.roastLevel.slice(1).toLowerCase()} roast`,
          `Roasted in small batches, shipped within 48 hours of roasting`,
          `Whole bean, ${c.weightGrams}g bag`,
          c.listPriceCents ? `Now on offer, roasted this week` : `Always fresh — roasted to order`,
        ],
        images: c.images,
        priceCents: c.priceCents,
        listPriceCents: c.listPriceCents ?? null,
        rating: c.rating,
        ratingCount: c.ratingCount,
        stock: c.stock,
        featured: c.featured ?? false,
      },
    });
  }

  const byRoast = await db.product.groupBy({ by: ["roastLevel"], _count: true });
  console.log(`Seeded ${COFFEES.length} coffees:`);
  for (const r of byRoast) console.log(`  ${r.roastLevel}: ${r._count}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
