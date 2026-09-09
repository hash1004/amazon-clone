"use client";

import { useState } from "react";

/**
 * Amazon wordmark. Renders the inline SVG mark by default and seamlessly
 * swaps in a PNG from /public if one has been added:
 *   amazon-logo-white.png  — for dark chrome (header, footer)
 *   amazon-logo-dark.png   — for light backgrounds (sign-in page)
 * Render with a height class only (e.g. `h-8`); width follows the ratio.
 */
export function AmazonLogo({
  className = "",
  tone = "light",
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
  const text = tone === "light" ? "#ffffff" : "#0f1111";
  return (
    <svg
      viewBox="0 0 102 40"
      className={className}
      role="img"
      aria-label="Amazon"
      preserveAspectRatio="xMinYMid meet"
    >
      <text
        x="1"
        y="24"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="25"
        fontWeight="700"
        letterSpacing="-1"
        fill={text}
      >
        amazon
      </text>
      <path
        d="M5 27c9.2 6.6 22.2 10 35.4 10 9.6 0 20.2-2.4 29.6-7"
        stroke="#FF9900"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M63.5 30.8c2.9-1.9 6.2-2.5 7.7-1.5 1.4 1 1.1 3.7-.6 6.7-.1-2.6-1-4.4-2.5-5.1-1.4-.7-3-.7-4.6-.1z"
        fill="#FF9900"
      />
    </svg>
  );
}
