"use client";

import { useState } from "react";

/**
 * Wordmark. Renders the inline SVG mark by default and seamlessly swaps in
 * a PNG from /public if one has been added:
 *   amazon-logo-white.png  — for dark chrome (unused by default in v2 —
 *                             header/footer chrome is light now)
 *   amazon-logo-dark.png   — for light backgrounds (header, sign-in page)
 * Render with a height class only (e.g. `h-8`); width follows the ratio.
 *
 * v2: plain italic serif wordmark (Newsreader) — the smile-swoosh mark was
 * dropped along with the rest of Amazon's own visual identity. `tone` now
 * just switches ink vs. inverse text color via tokens instead of a
 * hardcoded hex per tone. See design/redesign-v2-spec.md.
 */
export function AmazonLogo({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const [pngOk, setPngOk] = useState(false);
  const src =
    tone === "light" ? "/amazon-logo-white.png" : "/amazon-logo-dark.png";

  return (
    <>
      {/* probe: succeeds only if the PNG exists */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="hidden"
        onLoad={() => setPngOk(true)}
      />
      {pngOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Amazon" className={`${className} object-contain`} />
      ) : (
        <LogoSvg className={className} tone={tone} />
      )}
    </>
  );
}

function LogoSvg({ className }: { className: string; tone: "light" | "dark" }) {
  // fill is currentColor on purpose, not a hardcoded per-tone value — every
  // call site already sits in the right ambient text color (footer sets
  // text-inverse on itself, body defaults to text-primary elsewhere), and
  // this lets a wrapping link change the color on hover (see site-header.tsx)
  // without the logo needing to know about that state itself.
  return (
    <svg
      viewBox="0 0 102 30"
      className={className}
      role="img"
      aria-label="Amazon"
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
        fill="currentColor"
      >
        amazon
      </text>
    </svg>
  );
}
