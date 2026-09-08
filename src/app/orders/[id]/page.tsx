import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Your order" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const { placed } = await searchParams;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      {placed && (
        <div className="mb-4 rounded-lg border border-success/40 bg-success-subtle p-4">
          <h1 className="text-2xl font-bold text-success">
            Order placed, thank you!
          </h1>
          <p className="text-sm text-text-secondary">
            A confirmation would normally be emailed to {session.user.email}.
          </p>
        </div>
      )}

      <div className="bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap justify-between gap-2 border-b border-border-default pb-3 text-sm">
          <div>
            <p className="text-text-secondary">Order #</p>
            <p className="font-mono font-medium">{order.id}</p>
          </div>
          <div>
            <p className="text-text-secondary">Placed</p>
            <p className="font-medium">
              {order.createdAt.toLocaleDateString("en-US", {
                dateStyle: "medium",
              })}
            </p>
          </div>
          <div>
            <p className="text-text-secondary">Status</p>
            <p className="font-medium text-success">{order.status}</p>
          </div>
          <div>
            <p className="text-text-secondary">Total</p>
            <p className="font-bold">{formatPrice(order.totalCents)}</p>
          </div>
        </div>

        <div className="grid gap-6 py-4 sm:grid-cols-2">
          <div>
            <h2 className="mb-1 text-sm font-bold">Shipping to</h2>
            <address className="text-sm not-italic text-text-secondary">
              {order.shipName}
              <br />
              {order.shipLine1}
              {order.shipLine2 && (
                <>
                  <br />
                  {order.shipLine2}
                </>
              )}
              <br />
              {order.shipCity}, {order.shipState} {order.shipPostal}
              <br />
              {order.shipCountry}
            </address>
          </div>
          <div>
            <h2 className="mb-1 text-sm font-bold">Payment</h2>
            <p className="text-sm text-text-secondary">
              Card ending {order.paymentLast4} (mock)
            </p>
            <dl className="mt-2 space-y-0.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Items</dt>
                <dd>{formatPrice(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Shipping</dt>
                <dd>
                  {order.shippingCents === 0
                    ? "FREE"
                    : formatPrice(order.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Tax</dt>
                <dd>{formatPrice(order.taxCents)}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <h2 className="mb-2 border-t border-border-default pt-3 text-sm font-bold">
          Items
        </h2>
        <ul className="divide-y divide-border-default">
          {order.items.map((it) => (
            <li key={it.id} className="flex gap-3 py-3">
              <div className="relative h-16 w-16 shrink-0 bg-white">
                {it.imageSnapshot && (
                  <Image
                    src={it.imageSnapshot}
                    alt={it.titleSnapshot}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm">{it.titleSnapshot}</p>
                <p className="text-xs text-text-secondary">Qty {it.quantity}</p>
              </div>
              <p className="text-sm font-bold">
                {formatPrice(it.priceCentsSnapshot * it.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex gap-3">
        <Link href="/account/orders" className="link text-sm">
          View all orders
        </Link>
        <Link href="/s" className="link text-sm">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
