export const TRACKING_STAGES = [
  { key: "PLACED", label: "Order placed" },
  { key: "CONFIRMED", label: "Order confirmed" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
] as const;

const ORDER = TRACKING_STAGES.map((s) => s.key) as string[];

/**
 * Orders are created as CONFIRMED. Rather than run background jobs, we advance
 * the visible stage based on how long ago the order was placed — so a demo
 * order visibly progresses over the following hours/days.
 */
export function derivedStage(
  status: string,
  createdAt: Date,
  estimatedDelivery: Date | null,
): { index: number; stages: typeof TRACKING_STAGES; eta: Date | null } {
  if (status === "CANCELLED")
    return { index: -1, stages: TRACKING_STAGES, eta: estimatedDelivery };

  const hours = (Date.now() - createdAt.getTime()) / 36e5;
  let index = ORDER.indexOf(status);
  if (index < 1) index = 1; // CONFIRMED at minimum

  const schedule: [number, number][] = [
    [2, 2], // after 2h → PACKED
    [12, 3], // after 12h → SHIPPED
    [36, 4], // after 36h → OUT_FOR_DELIVERY
    [60, 5], // after 60h → DELIVERED
  ];
  for (const [h, i] of schedule) if (hours >= h) index = Math.max(index, i);

  if (estimatedDelivery && Date.now() >= estimatedDelivery.getTime())
    index = ORDER.indexOf("DELIVERED");

  return { index, stages: TRACKING_STAGES, eta: estimatedDelivery };
}

export function stageDate(createdAt: Date, stageIndex: number): Date {
  const offsets = [0, 0.05, 2, 12, 36, 60]; // hours per stage
  const d = new Date(createdAt);
  d.setTime(d.getTime() + (offsets[stageIndex] ?? 0) * 36e5);
  return d;
}

export const PAYMENT_LABEL: Record<string, string> = {
  card: "Card",
  upi: "UPI",
  cod: "Cash on Delivery",
};
