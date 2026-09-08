import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Your orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-surface p-8 text-center shadow-sm">
          <p className="text-lg font-bold">No orders yet</p>
          <Link href="/s" className="link mt-2 inline-block">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="bg-surface shadow-sm">
              <div className="flex flex-wrap gap-x-8 gap-y-1 border-b border-border-default bg-subtle px-4 py-2 text-xs">
                <div>
                  <p className="text-text-secondary">ORDER PLACED</p>
                  <p>
                    {order.createdAt.toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">TOTAL</p>
                  <p>{formatPrice(order.totalCents)}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-text-secondary">ORDER #</p>
                  <p className="truncate font-mono">{order.id}</p>
                </div>
                <div className="ml-auto self-center">
                  <Link href={`/orders/${order.id}`} className="link">
                    View order details
                  </Link>
                </div>
              </div>

              <div className="px-4 py-3">
                <p className="mb-2 text-sm font-bold text-success">
                  {order.status}
                </p>
                <div className="flex flex-wrap gap-3">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <div className="relative h-14 w-14 shrink-0 bg-white">
                        {it.imageSnapshot && (
                          <Image
                            src={it.imageSnapshot}
                            alt={it.titleSnapshot}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                      <span className="max-w-[180px] truncate text-sm">
                        {it.titleSnapshot}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
