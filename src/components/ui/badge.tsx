export function ChoiceBadge({
  label = "Amazon clone's Choice",
}: {
  label?: string;
}) {
  return (
    <span className="inline-flex items-center rounded-sm bg-[#232f3e] px-1.5 py-0.5 text-xs font-bold text-white">
      <span className="text-accent-buy">{label.split(" ")[0]}</span>
      <span className="ml-1">{label.split(" ").slice(1).join(" ")}</span>
    </span>
  );
}

export function OverallPickBadge() {
  return (
    <span className="inline-flex items-center rounded-sm bg-[#232f3e] px-1.5 py-0.5 text-xs font-bold text-white">
      Overall Pick
    </span>
  );
}
