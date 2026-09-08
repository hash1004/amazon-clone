export const FREE_SHIPPING_THRESHOLD_CENTS = 3500;
export const FLAT_SHIPPING_CENTS = 599;
export const TAX_RATE = 0.08;

export function orderTotals(subtotalCents: number) {
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
      ? 0
      : FLAT_SHIPPING_CENTS;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + shippingCents + taxCents;
  return { subtotalCents, shippingCents, taxCents, totalCents };
}
