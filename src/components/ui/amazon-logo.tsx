/**
 * Amazon-style wordmark: "amazon" with the orange smile/arrow from a → z.
 * `tone` controls the text colour (white on dark chrome, ink on light).
 */
export function AmazonLogo({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const text = tone === "light" ? "#ffffff" : "#0f1111";
  return (
    <svg viewBox="0 0 100 34" className={className} role="img" aria-label="Amazon">
      <text
        x="0"
        y="23"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="26"
        fontWeight="700"
        letterSpacing="-1.4"
        fill={text}
      >
        amazon
      </text>
      {/* the a→z smile */}
      <path
        d="M7 25.5c8.6 6 20 9.2 32.4 9.2 8.9 0 19.3-2.1 28.6-6.2"
        stroke="#FF9900"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* arrowhead flick under the 'n' */}
      <path d="M63.5 30.6c2.6-1.6 5.2-2.1 6.4-1.4 1.1.7 1 3-.2 5.1" fill="#FF9900" />
    </svg>
  );
}
