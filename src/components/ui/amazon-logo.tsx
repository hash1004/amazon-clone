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
 * dropped along with the rest of Amazon's own visual identity. Always the
 * brand accent now, not ink — but not one identical hex either: the vivid
 * button-orange (--accent-primary) fails text contrast on our light
 * backgrounds (~2:1), which is exactly why link/discount text already uses
 * a darker rust shade (--text-accent) instead of the button color. `tone`
 * picks the right one of those two shades for the background it's on:
 * "dark" (default — header, auth, light backgrounds) gets the rust shade;
 * "light" (footer, dark backgrounds) gets the vivid one, which needs the
 * brightness to read against near-black. See design/redesign-v2-spec.md.
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

function LogoSvg({
  className,
  tone,
}: {
  className: string;
  tone: "light" | "dark";
}) {
  const fill = tone === "light" ? "var(--accent-primary)" : "var(--text-accent)";
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
        fill={fill}
      >
        amazon
      </text>
    </svg>
  );
}
