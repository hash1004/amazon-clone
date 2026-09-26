"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { WishlistEntry } from "@/lib/wishlist-store";

async function userId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function entries(uid: string): Promise<WishlistEntry[]> {
  const rows = await db.wishlistItem.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
  return rows.map(({ product: p }) => ({
    productId: p.id,
    slug: p.slug,
    title: p.title,
    image: p.images[0] ?? "",
    priceCents: p.priceCents,
    listPriceCents: p.listPriceCents,
    rating: p.rating,
    ratingCount: p.ratingCount,
    inStock: p.stock > 0,
  }));
}

/**
 * The signed-in user's Saved Beans, newest first. `importIds` are product
 * ids saved in this browser before the list moved to the account — they're
 * merged in once so nobody loses what they'd saved. Null when signed out.
 */
export async function loadWishlist(importIds: string[] = []): Promise<WishlistEntry[] | null> {
  const uid = await userId();
  if (!uid) return null;
  if (importIds.length > 0) {
    const known = await db.product.findMany({
      where: { id: { in: importIds.slice(0, 100) } },
      select: { id: true },
    });
    await db.wishlistItem.createMany({
      data: known.map((p) => ({ userId: uid, productId: p.id })),
      skipDuplicates: true,
    });
  }
  return entries(uid);
}

/** Save or unsave one product; returns whether it's saved afterwards. */
export async function setSaved(productId: string, saved: boolean): Promise<{ ok: boolean }> {
  const uid = await userId();
  if (!uid) return { ok: false };
  if (saved) {
    const exists = await db.product.count({ where: { id: productId } });
    if (!exists) return { ok: false };
    await db.wishlistItem.upsert({
      where: { userId_productId: { userId: uid, productId } },
      create: { userId: uid, productId },
      update: {},
    });
  } else {
    await db.wishlistItem.deleteMany({ where: { userId: uid, productId } });
  }
  return { ok: true };
}
