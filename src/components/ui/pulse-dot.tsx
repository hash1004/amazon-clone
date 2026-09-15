/** Small static dot — signals "this is non-empty" without a numeric badge.
 * No pulsing/ping animation (removed per feedback — just the plain dot). */
export function PulseDot() {
  return (
    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent" />
  );
}
