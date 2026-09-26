import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/delivery";
import { derivedStage, orderNumber, PAYMENT_LABEL } from "@/lib/tracking";
import { TrackingTimeline } from "@/components/orders/tracking-timeline";
import { ReorderButton } from "@/components/orders/reorder-button";
import { OrderProgress, OrderStatusBadge } from "@/components/orders/order-status";

export const metadata: Metadata = { title: "Order details" };

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
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!order || order.userId !== session.user.id) notFound();

  const { index } = derivedStage(
    order.status,
    order.createdAt,
    order.estimatedDelivery,
  );
  const delivered = index >= 5;
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <nav className="mb-3 text-xs text-text-secondary">
        <Link href="/account/orders" className="link">
          Your Orders
        </Link>{" "}
        › <span>Order {orderNumber(order.id)}</span>
      </nav>

      {placed && (
        <div className="mb-5 border border-border-default border-l-4 border-l-accent bg-accent-subtle p-5">
          <h1 className="font-serif text-xl font-medium text-text-primary">
            Order placed, thank you!
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Order {orderNumber(order.id)}.{" "}
            Confirmation sent to {session.user.email}. Estimated delivery{" "}
            {order.estimatedDelivery
              ? formatDeliveryDate(order.estimatedDelivery)
              : "soon"}
            .
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Tracking */}
          <section className="border border-border-default bg-surface p-5">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl font-medium text-text-primary">
                {cancelled
                  ? "Cancelled"
                  : delivered
                    ? "Delivered"
                    : "Arriving " +
                      (order.estimatedDelivery
                        ? formatDeliveryDate(order.estimatedDelivery)
                        : "soon")}
              </h2>
              <OrderStatusBadge index={index} cancelled={cancelled} />
            </div>
            <p className="mb-4 text-sm text-text-secondary">
              {order.deliverySpeed === "express" ? "Express" : "Standard"} delivery
            </p>
            {!cancelled && (
              <div className="mb-5">
                <OrderProgress index={index} />
              </div>
            )}
            <TrackingTimeline
              currentIndex={index}
              createdAt={order.createdAt}
              cancelled={cancelled}
            />
          </section>

          {/* Items */}
          <section className="border border-border-default bg-surface p-5">
            <h2 className="mb-2 font-serif text-lg font-medium text-text-primary">
              {order.items.length} item{order.items.length > 1 ? "s" : ""}
            </h2>
            <ul className="divide-y divide-border-default">
              {order.items.map((it) => (
                <li key={it.id} className="flex gap-3 py-3">
                  <Link
                    href={`/p/${it.product.slug}`}
                    className="relative h-20 w-20 shrink-0 border border-border-default bg-subtle"
                  >
                    {it.imageSnapshot && (
                      <Image
                        src={it.imageSnapshot}
                        alt={it.titleSnapshot}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/p/${it.product.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:text-text-accent"
                    >
                      {it.titleSnapshot}
                    </Link>
                    <p className="text-xs text-text-secondary">
                      Qty {it.quantity} ·{" "}
                      {formatPrice(it.priceCentsSnapshot)} each
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatPrice(it.priceCentsSnapshot * it.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border-default pt-3">
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
          </section>
        </div>

        {/* Meta sidebar */}
        <aside className="h-fit space-y-4">
          <section className="border border-border-default bg-surface p-5 text-sm">
            <h2 className="mb-3 font-serif text-base font-medium text-text-primary">Order info</h2>
            <dl className="space-y-1">
              <Meta k="Order" v={orderNumber(order.id)} />
              <Meta
                k="Order date"
                v={order.createdAt.toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })}
              />
              <Meta
                k="Expected delivery"
                v={
                  order.estimatedDelivery
                    ? formatDeliveryDate(order.estimatedDelivery)
                    : "—"
                }
              />
            </dl>
          </section>

          <section className="border border-border-default bg-surface p-5 text-sm">
            <h2 className="mb-3 font-serif text-base font-medium text-text-primary">Delivery address</h2>
            <address className="not-italic text-text-secondary">
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
              {order.shipPhone && (
                <>
                  <br />
                  Phone: {order.shipPhone}
                </>
              )}
            </address>
          </section>

          <section className="border border-border-default bg-surface p-5 text-sm">
            <h2 className="mb-3 font-serif text-base font-medium text-text-primary">Payment</h2>
            <p className="text-text-secondary">
              {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
              {order.paymentLast4 ? ` ending ${order.paymentLast4}` : ""}
            </p>
            <dl className="mt-2 space-y-1">
              <Meta
                k="Items"
                v={formatPrice(order.subtotalCents + order.discountCents)}
              />
              {order.discountCents > 0 && (
                <Meta k="Discount" v={`−${formatPrice(order.discountCents)}`} />
              )}
              <Meta
                k="Delivery"
                v={
                  order.shippingCents === 0
                    ? "FREE"
                    : formatPrice(order.shippingCents)
                }
              />
              <Meta k="Tax" v={formatPrice(order.taxCents)} />
              <div className="mt-1 border-t border-border-default pt-2 font-semibold text-text-primary">
                <Meta k="Grand total" v={formatPrice(order.totalCents)} />
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-text-secondary">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
