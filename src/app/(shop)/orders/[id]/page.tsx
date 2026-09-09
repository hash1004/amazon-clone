import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/delivery";
import { derivedStage, PAYMENT_LABEL } from "@/lib/tracking";
import { TrackingTimeline } from "@/components/orders/tracking-timeline";
import { ReorderButton } from "@/components/orders/reorder-button";

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
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <nav className="mb-3 text-xs text-text-secondary">
        <Link href="/account/orders" className="link">
          Your Orders
        </Link>{" "}
        › <span>Order details</span>
      </nav>

      {placed && (
        <div className="mb-4 rounded-lg border border-success/40 bg-success-subtle p-4">
          <h1 className="text-xl font-bold text-success">
            Order placed, thank you!
          </h1>
          <p className="text-sm text-text-secondary">
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
          <section className="rounded-lg border border-border-default bg-surface p-4">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">
                {cancelled
                  ? "Cancelled"
                  : delivered
                    ? "Delivered"
                    : "Arriving " +
                      (order.estimatedDelivery
                        ? formatDeliveryDate(order.estimatedDelivery)
                        : "soon")}
              </h2>
              <span className="text-sm text-text-secondary">
                {order.deliverySpeed === "express" ? "Express" : "Standard"}{" "}
                delivery
              </span>
            </div>
            <TrackingTimeline
              currentIndex={index}
              createdAt={order.createdAt}
              cancelled={cancelled}
            />
          </section>

          {/* Items */}
          <section className="rounded-lg border border-border-default bg-surface p-4">
            <h2 className="mb-2 text-lg font-bold">
              {order.items.length} item{order.items.length > 1 ? "s" : ""}
            </h2>
            <ul className="divide-y divide-border-default">
              {order.items.map((it) => (
                <li key={it.id} className="flex gap-3 py-3">
                  <Link
                    href={`/p/${it.product.slug}`}
                    className="relative h-16 w-16 shrink-0 bg-white"
                  >
                    {it.imageSnapshot && (
                      <Image
                        src={it.imageSnapshot}
                        alt={it.titleSnapshot}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">{it.titleSnapshot}</p>
                    <p className="text-xs text-text-secondary">
                      Qty {it.quantity} ·{" "}
                      {formatPrice(it.priceCentsSnapshot)} each
                    </p>
                  </div>
                  <p className="text-sm font-bold">
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
          <section className="rounded-lg border border-border-default bg-surface p-4 text-sm">
            <h2 className="mb-2 font-bold">Order info</h2>
            <dl className="space-y-1">
              <Meta k="Order #" v={order.id} mono />
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

          <section className="rounded-lg border border-border-default bg-surface p-4 text-sm">
            <h2 className="mb-2 font-bold">Delivery address</h2>
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

          <section className="rounded-lg border border-border-default bg-surface p-4 text-sm">
            <h2 className="mb-2 font-bold">Payment</h2>
            <p className="text-text-secondary">
              {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
              {order.paymentLast4 ? ` ending ${order.paymentLast4}` : ""}
            </p>
            <dl className="mt-2 space-y-1">
              <Meta k="Items" v={formatPrice(order.subtotalCents)} />
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
              <div className="border-t border-border-default pt-1 font-bold">
                <Meta k="Grand total" v={formatPrice(order.totalCents)} />
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Meta({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-text-secondary">{k}</dt>
      <dd className={`text-right ${mono ? "font-mono text-xs" : ""}`}>{v}</dd>
    </div>
  );
}
