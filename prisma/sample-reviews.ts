import type { PrismaClient } from "../src/generated/prisma/client";

/**
 * Sample written reviews, keyed by coffee title. Seeded without a user, so
 * they never block a real customer from reviewing and never count as a
 * verified purchase. Their stars are already part of each coffee's seeded
 * rating/ratingCount, so seeding them doesn't move those numbers.
 */
type Sample = {
  author: string;
  rating: number;
  title: string;
  body: string;
  grind?: "whole" | "espresso" | "filter" | "french-press";
  daysAgo: number;
};

export const SAMPLE_REVIEWS: Record<string, Sample[]> = {
  "Ethiopia Yirgacheffe": [
    { author: "Maya R.", rating: 5, title: "Tastes like jasmine tea", daysAgo: 6, grind: "whole", body: "Brewed it as a V60 at 1:16 and it's floral and delicate, almost like tea. The bergamot really comes through as it cools." },
    { author: "Daniel K.", rating: 5, title: "My reference light roast", daysAgo: 19, grind: "filter", body: "Third bag. The roast date was two days before it arrived, and you can taste the freshness. Peachy, clean, no bitterness at all." },
    { author: "Priya S.", rating: 4, title: "Lovely, but not for espresso", daysAgo: 41, grind: "whole", body: "Beautiful as pour-over. I tried pulling shots and it was far too sour for me, so stick to filter methods with this one." },
    { author: "Tom W.", rating: 5, title: "Converted a dark-roast drinker", daysAgo: 73, body: "My partner only drinks French roast and asked for a second cup of this. That says it all." },
  ],
  "Kenya Nyeri AA": [
    { author: "Grace O.", rating: 5, title: "Blackcurrant bomb", daysAgo: 4, grind: "filter", body: "Juicy and bright with a big blackcurrant hit. The savory tomato note sounds odd, but it works and gives it depth." },
    { author: "Luis M.", rating: 4, title: "Intense, in a good way", daysAgo: 27, grind: "whole", body: "Very high acidity. I had to grind a touch finer and use slightly hotter water to balance it, then it was excellent." },
    { author: "Hannah B.", rating: 5, title: "Worth grabbing while it lasts", daysAgo: 55, body: "Stock always seems low and now I see why. Complex, winey, sweet finish. Great in an AeroPress." },
    { author: "Chris P.", rating: 4, title: "Great, but a lot of acidity", daysAgo: 90, grind: "filter", body: "Fantastic coffee if you like bright. Not a morning-mug-with-milk coffee though. I drink it black in the afternoon." },
  ],
  "Colombia Pink Bourbon": [
    { author: "Ines G.", rating: 5, title: "Strawberry jam, honestly", daysAgo: 3, grind: "whole", body: "I didn't believe the tasting notes until I tried it. Strawberry and brown sugar, super sweet and round. Best coffee I've bought this year." },
    { author: "Sam T.", rating: 5, title: "Sweet and easy to brew", daysAgo: 22, grind: "filter", body: "Forgiving recipe-wise. Every brew I tried tasted good, even a lazy drip batch. Apple-y finish." },
    { author: "Olivia N.", rating: 5, title: "Gift-worthy", daysAgo: 48, body: "Bought a 2 lb bag and split it with my sister. We both loved it. Clean, fruity and never sour." },
    { author: "Marcus L.", rating: 4, title: "Excellent, pricier than my usual", daysAgo: 80, grind: "whole", body: "It's a treat coffee for me. Delicious, especially as pour-over, but I save it for weekends." },
  ],
  "Ethiopia Guji Natural": [
    { author: "Aisha D.", rating: 5, title: "Blueberry muffin in a cup", daysAgo: 8, grind: "whole", body: "Big blueberry aroma the second you open the bag. Wine-like body with a dark chocolate finish. Unreal as a cold brew too." },
    { author: "Ben H.", rating: 4, title: "Funky and fun", daysAgo: 30, grind: "filter", body: "Natural-process funk is definitely there. I love it, but if you like clean washed coffees this might be a lot." },
    { author: "Rosa V.", rating: 5, title: "Best natural I've had", daysAgo: 57, body: "Sweet, fruity and heavy-bodied. It made a surprisingly good fruity espresso at a longer ratio." },
    { author: "Kevin J.", rating: 4, title: "Great fruit, slight ferment", daysAgo: 96, grind: "french-press", body: "In the French press it's heavy and jammy. A little boozy for my taste some mornings, but still very good." },
  ],
  "Guatemala Huehuetenango": [
    { author: "Ethan C.", rating: 5, title: "The everyday bag", daysAgo: 5, grind: "filter", body: "Chocolate, orange and a nutty finish. Balanced and easy. This is what I keep in the cupboard at all times." },
    { author: "Nora F.", rating: 5, title: "Works any way I brew it", daysAgo: 25, grind: "whole", body: "Pour-over, French press, even as espresso. It tastes good every way. Great with milk too." },
    { author: "Jorge A.", rating: 4, title: "Solid and comforting", daysAgo: 51, body: "Not flashy, just really good coffee. The orange note is subtle but there when it cools." },
    { author: "Lily Z.", rating: 5, title: "On a three-week reorder loop", daysAgo: 84, grind: "french-press", body: "I reorder every three weeks. Milk chocolate and almond with a clean finish in the press." },
  ],
  "Costa Rica Tarrazú": [
    { author: "Paula E.", rating: 5, title: "Caramel and apple", daysAgo: 9, grind: "filter", body: "Honey process makes it so sweet. Caramel up front and a crisp red apple finish. Lovely in a Chemex." },
    { author: "Ryan S.", rating: 4, title: "Sweet, medium body", daysAgo: 33, grind: "whole", body: "Very pleasant, sweet and clean. I'd like a bit more body, but that's personal preference." },
    { author: "Mei L.", rating: 5, title: "Honey is the right word", daysAgo: 62, body: "Sweetest medium roast in the lineup. Great black, and fine with a splash of oat milk." },
    { author: "Adam G.", rating: 4, title: "Great, sells out fast", daysAgo: 101, grind: "filter", body: "Tried to reorder and it was nearly gone. Excellent coffee, wish there was more of it." },
  ],
  "Colombia Supremo": [
    { author: "Heather M.", rating: 5, title: "Crowd-pleaser", daysAgo: 2, grind: "filter", body: "I brew this for the office drip machine and everyone asks what it is. Caramel and walnut, zero bitterness." },
    { author: "Victor R.", rating: 4, title: "Reliable and good value", daysAgo: 18, grind: "whole", body: "The 2 lb bag is great value for daily drinking. Not complex, but consistently tasty." },
    { author: "Jen T.", rating: 5, title: "Great with milk", daysAgo: 44, body: "Makes a lovely latte. The citrus note keeps it from being flat." },
    { author: "Omar B.", rating: 4, title: "Classic Colombian", daysAgo: 77, grind: "french-press", body: "Exactly what I want from a Colombian. Smooth and nutty in the press. Would buy again." },
  ],
  "Honduras Marcala": [
    { author: "Sofia P.", rating: 5, title: "Plummy and sweet", daysAgo: 12, grind: "filter", body: "Brown sugar and a nice plum note. Very smooth. A hidden gem in the medium roasts." },
    { author: "Greg D.", rating: 4, title: "Mellow morning coffee", daysAgo: 38, grind: "whole", body: "Low drama, just a pleasant sweet cup. Good for people who find light roasts too sharp." },
    { author: "Aya K.", rating: 4, title: "Nice, a bit subtle", daysAgo: 66, body: "Tasty, but the notes are soft. I'd like a little more punch. Still enjoyable daily." },
    { author: "Frank H.", rating: 5, title: "Almond finish is great", daysAgo: 99, grind: "french-press", body: "Almond and brown sugar in the French press. Really comforting on cold mornings." },
  ],
  "Brazil Cerrado": [
    { author: "Carla J.", rating: 5, title: "Nutella in a cup", daysAgo: 7, grind: "espresso", body: "Hazelnut and milk chocolate, super low acidity. Makes a sweet, thick espresso and a great flat white." },
    { author: "Mike S.", rating: 4, title: "Easy on the stomach", daysAgo: 29, grind: "whole", body: "I can't do acidic coffee and this one is perfect for me. Smooth and nutty." },
    { author: "Tanya W.", rating: 5, title: "Perfect cold brew base", daysAgo: 58, grind: "french-press", body: "Coarse grind, 1:8 overnight. Chocolatey and smooth, and great with a splash of milk." },
    { author: "Pete N.", rating: 4, title: "Good, simple", daysAgo: 88, body: "Not complex, but that's the point. Dependable, chocolatey everyday coffee." },
  ],
  "Sumatra Mandheling": [
    { author: "Derek F.", rating: 5, title: "Earthy and heavy, as it should be", daysAgo: 10, grind: "french-press", body: "Cedar, dark chocolate and that classic Sumatran earthiness. Syrupy body in the press. Love it." },
    { author: "Lena B.", rating: 4, title: "Bold without being burnt", daysAgo: 35, grind: "whole", body: "Dark and full but not charred like supermarket dark roasts. Great with cream." },
    { author: "Raj P.", rating: 4, title: "Very earthy", daysAgo: 64, body: "Delicious if you like earthy coffee. My wife finds it too herbal, so know what you're getting." },
    { author: "Hugo M.", rating: 5, title: "Moka pot heaven", daysAgo: 93, grind: "espresso", body: "In a moka pot it's thick and chocolatey. Exactly what I wanted from a dark roast." },
  ],
  "House Espresso Blend": [
    { author: "Anna C.", rating: 5, title: "Dialed in within three shots", daysAgo: 1, grind: "espresso", body: "18 g in, 36 g out, about 28 seconds. Cocoa and molasses, thick crema. Very forgiving blend." },
    { author: "Jake R.", rating: 5, title: "Best for milk drinks", daysAgo: 23, grind: "whole", body: "Cuts through milk beautifully. My cortados have never been better." },
    { author: "Elena S.", rating: 4, title: "Great, slightly roasty straight", daysAgo: 50, grind: "espresso", body: "Wonderful in lattes. As a straight shot it's a bit roasty for me, but that's what I expected." },
    { author: "Will T.", rating: 5, title: "Home cafe staple", daysAgo: 86, body: "Bought the 2 lb bag. Consistent from first shot to last. Sweet, low acid, chocolatey." },
  ],
  "French Roast": [
    { author: "Carl D.", rating: 5, title: "Finally a real dark roast", daysAgo: 14, grind: "french-press", body: "Smoky and bittersweet, exactly what I drink black every morning. Fresh, which you can't get at the store." },
    { author: "Maria L.", rating: 4, title: "Bold, as promised", daysAgo: 39, grind: "filter", body: "Strong and smoky. Great with milk and sugar. A bit much for me black." },
    { author: "Steve G.", rating: 4, title: "Good, a little one-note", daysAgo: 70, body: "Does what it says. Smoke and dark chocolate. I prefer the Sumatra for more depth." },
    { author: "Nina O.", rating: 4, title: "Great iced", daysAgo: 104, grind: "whole", body: "Surprisingly good as iced coffee. The bittersweet edge holds up to ice and milk." },
  ],
};

/**
 * Adds the sample reviews to any coffee that has no reviews yet. Safe to
 * run against a live database: it only inserts, and it skips any coffee
 * that already has reviews (seeded or real), so re-running is a no-op.
 */
export async function seedSampleReviews(db: PrismaClient) {
  let added = 0;
  const now = Date.now();
  for (const [title, samples] of Object.entries(SAMPLE_REVIEWS)) {
    const product = await db.product.findFirst({ where: { title }, select: { id: true } });
    if (!product) continue;
    if ((await db.review.count({ where: { productId: product.id } })) > 0) continue;
    await db.review.createMany({
      data: samples.map((s) => ({
        productId: product.id,
        authorName: s.author,
        rating: s.rating,
        title: s.title,
        body: s.body,
        grind: s.grind ?? null,
        createdAt: new Date(now - s.daysAgo * 86_400_000),
      })),
    });
    added += samples.length;
  }
  return added;
}
