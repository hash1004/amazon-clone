export type DeliverySpeed = "standard" | "express";

export const DELIVERY_OPTIONS: {
  id: DeliverySpeed;
  label: string;
  blurb: string;
  feeCents: number;
  minDays: number;
  maxDays: number;
}[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    blurb: "FREE delivery on eligible orders",
    feeCents: 0,
    minDays: 4,
    maxDays: 6,
  },
  {
    id: "express",
    label: "Express Delivery",
    blurb: "Get it faster",
    feeCents: 999,
    minDays: 1,
    maxDays: 2,
  },
];

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

export function deliveryOption(id: string) {
  return DELIVERY_OPTIONS.find((o) => o.id === id) ?? DELIVERY_OPTIONS[0];
}

/** Estimated delivery Date for the given speed, from `from` (default now). */
export function estimateDelivery(speed: string, from = new Date()): Date {
  const o = deliveryOption(speed);
  return addBusinessDays(from, o.maxDays);
}

export function formatDeliveryDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function deliveryRange(speed: string, from = new Date()): string {
  const o = deliveryOption(speed);
  const lo = addBusinessDays(from, o.minDays);
  const hi = addBusinessDays(from, o.maxDays);
  const fmt = (x: Date) =>
    x.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return `${fmt(lo)} – ${fmt(hi)}`;
}
