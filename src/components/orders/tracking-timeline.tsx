import { TRACKING_STAGES, stageDate } from "@/lib/tracking";

export function TrackingTimeline({
  currentIndex,
  createdAt,
  cancelled,
}: {
  currentIndex: number;
  createdAt: Date;
  cancelled?: boolean;
}) {
  if (cancelled) {
    return (
      <p className="bg-danger-subtle p-3 text-sm font-medium text-danger">This order was cancelled.</p>
    );
  }

  return (
    <ol className="relative ml-1">
      {TRACKING_STAGES.map((s, i) => {
        const reached = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={s.key} className="flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <span
                className={`z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  reached
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border-strong bg-surface text-transparent"
                } ${isCurrent ? "ring-4 ring-accent-subtle" : ""}`}
              >
                ✓
              </span>
              {i < TRACKING_STAGES.length - 1 && (
                <span
                  className={`-mb-5 w-0.5 flex-1 ${i < currentIndex ? "bg-accent" : "bg-border-default"}`}
                />
              )}
            </div>
            <div className="pb-1">
              <p
                className={`text-sm ${
                  isCurrent
                    ? "font-semibold text-text-accent"
                    : reached
                      ? "font-medium text-text-primary"
                      : "text-text-secondary"
                }`}
              >
                {s.label}
              </p>
              {reached && (
                <p className="text-xs text-text-secondary">
                  {stageDate(createdAt, i).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
