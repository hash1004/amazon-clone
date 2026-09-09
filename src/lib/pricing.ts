import { deliveryOption } from "@/lib/delivery";

export const TAX_RATE = 0.08;

/**
 * Order money math. `listSubtotalCents` is the sum of list (MRP) prices; the
 * difference from the real subtotal is shown as "discount".
 */
export function orderTotals(
  subtotalCents: number,
  opts: { deliverySpeed?: string; listSubtotalCents?: number } = {},
) {
  const shippingCents = deliveryOption(opts.deliverySpeed ?? "standard").feeCents;
  const discountCents = Math.max(
    0,
    (opts.listSubtotalCents ?? subtotalCents) - subtotalCents,
  );
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + shippingCents + taxCents;
  return { subtotalCents, discountCents, shippingCents, taxCents, totalCents };
}
