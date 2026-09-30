import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedSampleReviews } from "./sample-reviews";

// Adds sample reviews to coffees that have none. Insert-only and safe on the
// live database (unlike prisma/seed.ts, which wipes the catalog and orders).
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

seedSampleReviews(db)
  .then((n) => console.log(`Added ${n} sample reviews.`))
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
