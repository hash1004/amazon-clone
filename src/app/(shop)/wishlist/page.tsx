import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WishlistClient } from "./wishlist-client";

export const metadata: Metadata = { title: "Your List" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/wishlist");
  return <WishlistClient />;
}
