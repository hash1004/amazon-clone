/**
 * Wordmark — "Still Coffee and Co." in full, upright Fraunces. `tone`
 * picks the shade for the background it sits on: "dark" (default — auth,
 * light backgrounds) gets the espresso-rust shade; "light" (header,
 * footer, dark brown backgrounds) gets cream — the same shade every other
 * headline on brown already uses, so the wordmark pops instead of
 * blending into the block behind it.
 *
 * `textLength` + `lengthAdjust` force the string to fill the viewBox
 * exactly, so the SVG scales predictably at any height without needing
 * to hand-measure the font's real glyph widths.
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
      viewBox="0 0 230 30"
      className={className}
      role="img"
      aria-label="Still Coffee and Co."
      preserveAspectRatio="xMinYMid meet"
    >
      <text
        x="1"
        y="22"
        textLength="228"
        lengthAdjust="spacingAndGlyphs"
        style={{
          fontFamily: "var(--font-display), serif",
          fontWeight: 600,
        }}
        fontSize="22"
        fill={fill}
      >
        Still Coffee and Co.
      </text>
    </svg>
  );
}
