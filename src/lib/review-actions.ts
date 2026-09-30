"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isGrind } from "@/lib/variants";

export type ReviewResult = { ok: true } | { ok: false; error: string };

/**
 * One review per signed-in customer per coffee. The stars also fold into
 * the product's summary rating, so the number at the top of the page moves
 * with what people actually write.
 */
export async function createReview(form: FormData): Promise<ReviewResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sign in to write a review." };

  const productId = String(form.get("productId") ?? "");
  const rating = Number(form.get("rating"));
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  const grindRaw = String(form.get("grind") ?? "");
  const grind = isGrind(grindRaw) ? grindRaw : null;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { ok: false, error: "Choose a star rating." };
  if (title.length < 3 || title.length > 80)
    return { ok: false, error: "Give your review a title (3–80 characters)." };
  if (body.length < 20 || body.length > 1500)
    return { ok: false, error: "Write at least 20 characters (up to 1,500)." };

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true },
  });
  if (!product) return { ok: false, error: "That coffee no longer exists." };

  const existing = await db.review.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { id: true },
  });
  if (existing) return { ok: false, error: "You've already reviewed this coffee." };

  const [user, bought] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    db.orderItem.count({
      where: { productId, order: { userId, status: { not: "CANCELLED" } } },
    }),
  ]);
  // First name and last initial — enough to feel human, not enough to find someone.
  const parts = (user?.name ?? "").trim().split(/\s+/).filter(Boolean);
  const authorName =
    parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1][0]}.`
      : parts[0] ?? user?.email?.split("@")[0] ?? "Customer";

  try {
    await db.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          productId,
          userId,
          authorName,
          rating,
          title,
          body,
          grind,
          verified: bought > 0,
        },
      });
      // Running average, computed in the database so two reviews landing at
      // once can't overwrite each other's contribution.
      await tx.$executeRaw`
        UPDATE "Product"
        SET "rating" = ("rating" * "ratingCount" + ${rating}) / ("ratingCount" + 1),
            "ratingCount" = "ratingCount" + 1
        WHERE "id" = ${productId}`;
    });
  } catch (e) {
    // Unique (productId, userId): a double submit.
    if ((e as { code?: string }).code === "P2002")
      return { ok: false, error: "You've already reviewed this coffee." };
    throw e;
  }

  revalidatePath(`/p/${product.slug}`);
  return { ok: true };
}
