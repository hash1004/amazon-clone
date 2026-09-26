/**
 * Wordmark — "Still", italic serif (Newsreader), lowercase, one accent.
 * `tone` picks the shade for the background it sits on: "dark" (default —
 * header, auth, light backgrounds) gets the darker espresso-rust shade;
 * "light" (footer, dark backgrounds) gets the brighter caramel accent,
 * which needs the extra brightness to read against near-black.
 */
export function BrandLogo({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const fill = tone === "light" ? "var(--accent-primary)" : "var(--text-accent)";
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
          fontFamily: "var(--font-display), Georgia, serif",
          fontStyle: "italic",
          fontWeight: 500,
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
