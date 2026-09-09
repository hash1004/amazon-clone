"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK = "/placeholder.svg";

/**
 * next/image that swaps to a placeholder if the source fails or is empty.
 * Follows `src` changes (e.g. a gallery switching images) — it only falls
 * back for the exact URL that errored.
 */
export function SafeImage({ src, alt, ...rest }: ImageProps) {
  const [failed, setFailed] = useState<string | null>(null);

  const wanted =
    typeof src === "string" && src.length > 0 ? src : FALLBACK;
  const show = typeof src === "string" && src === failed ? FALLBACK : wanted;

  return (
    <Image
      {...rest}
      src={show}
      alt={alt}
      onError={() => {
        if (typeof src === "string") setFailed(src);
      }}
    />
  );
}
