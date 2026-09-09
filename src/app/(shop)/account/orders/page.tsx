import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/delivery";
import { derivedStage, TRACKING_STAGES } from "@/lib/tracking";
import { ReorderButton } from "@/components/orders/reorder-button";

export const metadata: Metadata = { title: "Your Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { select: { slug: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-border-default bg-surface p-8 text-center">
          <p className="text-lg font-bold">You have no orders yet</p>
          <Link
            href="/s"
            className="mt-3 inline-block rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const { index } = derivedStage(
              order.status,
              order.createdAt,
              order.estimatedDelivery,
            );
            const cancelled = order.status === "CANCELLED";
            const stageLabel = cancelled
              ? "Cancelled"
              : TRACKING_STAGES[index]?.label ?? "Processing";
            return (
              <li
                key={order.id}
                className="overflow-hidden rounded-lg border border-border-default bg-surface"
              >
                <div className="flex flex-wrap gap-x-10 gap-y-1 border-b border-border-default bg-subtle px-4 py-2 text-xs">
                  <Col k="Order placed">
                    {order.createdAt.toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </Col>
                  <Col k="Total">{formatPrice(order.totalCents)}</Col>
                  <Col k="Ship to">{order.shipName}</Col>
                  <div className="ml-auto self-center">
                    <Link href={`/orders/${order.id}`} className="link">
                      View order details
                    </Link>
                    <span className="mx-2 text-border-strong">|</span>
                    <Link href={`/orders/${order.id}`} className="link">
                      Track package
                    </Link>
                  </div>
                </div>

                <div className="p-4">
                  <p
                    className={`mb-2 text-sm font-bold ${
                      cancelled ? "text-danger" : "text-success"
                    }`}
                  >
                    {stageLabel}
                    {!cancelled && index < 5 && order.estimatedDelivery && (
                      <span className="font-normal text-text-secondary">
                        {" "}
                        · arriving {formatDeliveryDate(order.estimatedDelivery)}
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {order.items.map((it) => (
                      <Link
                        key={it.id}
                        href={`/p/${it.product.slug}`}
                        className="flex items-center gap-2"
                      >
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
                        <span className="max-w-[180px] truncate text-sm hover:text-text-accent">
                          {it.titleSnapshot}
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3">
                    <ReorderButton
                      items={order.items.map((it) => ({
                        productId: it.productId,
                        slug: it.product.slug,
                        title: it.titleSnapshot,
                        image: it.imageSnapshot,
                        priceCents: it.priceCentsSnapshot,
                        quantity: it.quantity,
                      }))}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Col({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="uppercase text-text-secondary">{k}</p>
      <p>{children}</p>
    </div>
  );
}
