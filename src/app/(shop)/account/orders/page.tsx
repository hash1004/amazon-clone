import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/delivery";
import { derivedStage, orderNumber, TRACKING_STAGES } from "@/lib/tracking";
import { ReorderButton } from "@/components/orders/reorder-button";
import { reorderLine, REORDER_PRODUCT_SELECT } from "@/lib/reorder";
import { OrderProgress, OrderStatusBadge } from "@/components/orders/order-status";
import { SorryMug } from "@/components/ui/sorry-mug";

export const metadata: Metadata = { title: "Your orders" };

// Thumbnails shown per order before the rest collapse into a "+N" tile.
const THUMBS = 4;

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { select: REORDER_PRODUCT_SELECT } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-serif text-2xl font-medium text-text-primary">Your orders</h1>
        {orders.length > 0 && (
          <p className="text-sm text-text-secondary">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-6 border border-border-default bg-surface p-10 text-center sm:flex-row sm:text-left">
          <SorryMug className="h-36 w-36 shrink-0" />
          <div>
            <p className="font-serif text-xl font-medium text-text-primary">No orders yet</p>
            <p className="mt-1 text-sm text-text-secondary">
              When you order a bag, you can follow it from roaster to doorstep here.
            </p>
            <Link
              href="/s"
              className="mt-4 inline-block bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
            >
              Browse coffee
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-5">
          {orders.map((order) => {
            const { index } = derivedStage(order.status, order.createdAt, order.estimatedDelivery);
            const cancelled = order.status === "CANCELLED";
            const delivered = !cancelled && index >= TRACKING_STAGES.length - 1;
            const bags = order.items.reduce((n, it) => n + it.quantity, 0);
            const eta = order.estimatedDelivery ? formatDeliveryDate(order.estimatedDelivery) : null;

            return (
              <li key={order.id} className="border border-border-default bg-surface">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-border-default bg-subtle px-5 py-3 text-xs">
                  <Col k="Order">{orderNumber(order.id)}</Col>
                  <Col k="Placed">
                    {order.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </Col>
                  <Col k="Total">{formatPrice(order.totalCents)}</Col>
                  <Col k="Ship to">{order.shipName}</Col>
                  <div className="ml-auto">
                    <OrderStatusBadge index={index} cancelled={cancelled} />
                  </div>
                </div>

                <div className="p-5">
                  <p className="font-serif text-lg font-medium text-text-primary">
                    {cancelled
                      ? "This order was cancelled"
                      : delivered
                        ? "Delivered"
                        : eta
                          ? `Arriving ${eta}`
                          : "On its way"}
                  </p>
                  {!cancelled && (
                    <div className="mt-2 max-w-md">
                      <OrderProgress index={index} />
                    </div>
                  )}

                  {/* Fixed-size strip however many coffees are in the order: a few
                      thumbnails, a "+N" tile for the rest, and the names as one
                      clamped line. Full item list is on the order page. */}
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <ul className="flex shrink-0 gap-2">
                      {order.items.slice(0, THUMBS).map((it) => (
                        <li key={it.id}>
                          <Link
                            href={`/p/${it.product.slug}`}
                            title={it.titleSnapshot}
                            className="relative block h-14 w-14 border border-border-default bg-subtle"
                          >
                            {it.imageSnapshot && (
                              <Image
                                src={it.imageSnapshot}
                                alt={it.titleSnapshot}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            )}
                            {it.quantity > 1 && (
                              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-text-accent px-1 text-[10px] font-bold text-text-inverse">
                                ×{it.quantity}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                      {order.items.length > THUMBS && (
                        <li>
                          <Link
                            href={`/orders/${order.id}`}
                            className="flex h-14 w-14 items-center justify-center border border-border-default bg-subtle text-sm font-semibold text-text-secondary hover:text-text-accent"
                            aria-label={`${order.items.length - THUMBS} more items`}
                          >
                            +{order.items.length - THUMBS}
                          </Link>
                        </li>
                      )}
                    </ul>
                    <p className="line-clamp-2 min-w-0 text-sm text-text-secondary">
                      {order.items.map((it, i) => (
                        <span key={it.id}>
                          {i > 0 && ", "}
                          <span className="text-text-primary">{it.titleSnapshot}</span>
                          {it.quantity > 1 && ` ×${it.quantity}`}
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border-default pt-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
                    >
                      Track &amp; view details
                    </Link>
                    <ReorderButton
                      items={order.items.map(reorderLine)}
                    />
                    <span className="ml-auto text-xs text-text-secondary">
                      {bags} {bags === 1 ? "bag" : "bags"}
                    </span>
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
      <p className="uppercase tracking-wide text-text-muted">{k}</p>
      <p className="font-medium text-text-primary">{children}</p>
    </div>
  );
}
