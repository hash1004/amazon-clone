import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = { title: "Your Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/addresses");

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <nav className="mb-2 text-xs text-text-secondary">
        <Link href="/account" className="link">
          Your Account
        </Link>{" "}
        › <span>Your Addresses</span>
      </nav>
      <h1 className="mb-4 text-2xl font-bold">Your Addresses</h1>
      <AddressManager addresses={addresses} />
    </div>
  );
}
