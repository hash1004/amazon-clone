"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK = "/placeholder.svg";

/** next/image that swaps to a placeholder if the source fails or is empty. */
export function SafeImage({ src, alt, ...rest }: ImageProps) {
  const initial = typeof src === "string" && src.length > 0 ? src : FALLBACK;
  const [current, setCurrent] = useState<ImageProps["src"]>(initial);
  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      onError={() => setCurrent(FALLBACK)}
    />
  );
}
