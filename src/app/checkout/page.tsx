import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return (
    <CheckoutClient
      defaultName={session.user.name ?? ""}
    />
  );
}
