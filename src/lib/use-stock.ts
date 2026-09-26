"use client";

import { useEffect, useState } from "react";

/**
 * Live stock for a set of products (the cart is stored in the browser, so it
 * doesn't know what's left). Null until loaded — callers should treat that
 * as "unknown", not "sold out".
 */
export function useStock(productIds: string[]): Record<string, number> | null {
  const key = [...productIds].sort().join(",");
  const [loaded, setLoaded] = useState<{ key: string; stock: Record<string, number> } | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/stock?ids=${encodeURIComponent(key)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { stock: Record<string, number> } | null) => {
        if (!cancelled && d) setLoaded({ key, stock: d.stock });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key]);

  return loaded?.key === key ? loaded.stock : null;
}
