import { TRACKING_STAGES } from "@/lib/tracking";

/** Square status label: caramel while on its way, solid brown once delivered, rust if cancelled. */
export function OrderStatusBadge({ index, cancelled }: { index: number; cancelled: boolean }) {
  const delivered = index >= TRACKING_STAGES.length - 1;
  const label = cancelled ? "Cancelled" : (TRACKING_STAGES[index]?.label ?? "Processing");
  const tone = cancelled
    ? "bg-danger-subtle text-danger"
    : delivered
      ? "bg-text-accent text-text-inverse"
      : "bg-accent-subtle text-text-accent";
  return <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>;
}

/** Six-segment bar, one per tracking stage, filled up to the current one. */
export function OrderProgress({ index }: { index: number }) {
  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={TRACKING_STAGES.length}
      aria-valuenow={index + 1}
      aria-label="Delivery progress"
    >
      {TRACKING_STAGES.map((s, i) => (
        <span key={s.key} className={`h-1.5 flex-1 ${i <= index ? "bg-accent" : "bg-border-default"}`} />
      ))}
    </div>
  );
}
