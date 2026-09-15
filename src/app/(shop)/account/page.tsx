import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = { title: "Your account" };

/**
 * The full account hub — on phones this is where the bottom nav's
 * "Profile" tab lands directly (no dropdown to fall back to there), so
 * it needs to carry everything the desktop account-menu dropdown offers:
 * Orders, Cart, Wishlist, Addresses, Sign out.
 */
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const orderCount = await db.order.count({
    where: { userId: session.user.id },
  });

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Your Account</h1>
      <p className="mb-4 text-sm text-text-secondary">
        Signed in as {session.user.email}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-lg bg-surface p-5 shadow-sm hover:shadow-md"
        >
          <h2 className="font-bold">Your Orders</h2>
          <p className="text-sm text-text-secondary">
            {orderCount} {orderCount === 1 ? "order" : "orders"} — track, view details
          </p>
        </Link>
        <Link
          href="/account/addresses"
          className="rounded-lg bg-surface p-5 shadow-sm hover:shadow-md"
        >
          <h2 className="font-bold">Your Addresses</h2>
          <p className="text-sm text-text-secondary">Manage shipping addresses</p>
        </Link>
        <Link href="/cart" className="rounded-lg bg-surface p-5 shadow-sm hover:shadow-md">
          <h2 className="font-bold">Your Cart</h2>
          <p className="text-sm text-text-secondary">Review items and check out</p>
        </Link>
        <Link
          href="/wishlist"
          className="rounded-lg bg-surface p-5 shadow-sm hover:shadow-md"
        >
          <h2 className="font-bold">Your List</h2>
          <p className="text-sm text-text-secondary">Items you&apos;ve saved for later</p>
        </Link>
      </div>
      <SignOutButton className="mt-6 text-sm text-text-secondary hover:text-text-accent hover:underline" />
    </div>
  );
}
