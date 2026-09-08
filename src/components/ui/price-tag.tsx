import { priceParts } from "@/lib/format";

const SIZE = {
  sm: { sup: "text-[0.6rem]", whole: "text-sm", frac: "text-[0.6rem]" },
  md: { sup: "text-xs", whole: "text-lg", frac: "text-xs" },
  lg: { sup: "text-sm", whole: "text-3xl", frac: "text-sm" },
} as const;

export function PriceTag({
  cents,
  size = "md",
  className = "",
}: {
  cents: number;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const { whole, frac } = priceParts(cents);
  const s = SIZE[size];
  return (
    <span className={`inline-flex items-start text-text-primary ${className}`}>
      <span className={`mt-0.5 ${s.sup}`}>$</span>
      <span className={`${s.whole} font-medium leading-none`}>{whole}</span>
      <span className={`mt-0.5 ${s.frac}`}>{frac}</span>
    </span>
  );
}
