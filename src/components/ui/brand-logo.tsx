/**
 * Wordmark — "Still", upright Fraunces, lowercase, one accent. `tone`
 * picks the shade for the background it sits on: "dark" (default — auth,
 * light backgrounds) gets the espresso-rust shade; "light" (header,
 * footer, dark brown backgrounds) gets cream — the same shade every other
 * headline on brown already uses, so the wordmark pops instead of
 * blending into the block behind it.
 */
export function BrandLogo({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const fill = tone === "light" ? "var(--text-on-brown)" : "var(--text-accent)";
  return (
    <svg
      viewBox="0 0 78 30"
      className={className}
      role="img"
      aria-label="Still Coffee Co."
      preserveAspectRatio="xMinYMid meet"
    >
      <text
        x="1"
        y="22"
        style={{
          fontFamily: "var(--font-display), serif",
          fontWeight: 600,
        }}
        fontSize="24"
        letterSpacing="-0.5"
        fill={fill}
      >
        still
      </text>
    </svg>
  );
}
