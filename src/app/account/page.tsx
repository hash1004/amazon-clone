import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Your account" };

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
        <Link href="/account/orders" className="bg-surface p-5 shadow-sm hover:shadow-md">
          <h2 className="font-bold">Your Orders</h2>
          <p className="text-sm text-text-secondary">
            {orderCount} {orderCount === 1 ? "order" : "orders"} — track, view details
          </p>
        </Link>
        <Link href="/cart" className="bg-surface p-5 shadow-sm hover:shadow-md">
          <h2 className="font-bold">Your Cart</h2>
          <p className="text-sm text-text-secondary">Review items and check out</p>
        </Link>
      </div>
    </div>
  );
}
