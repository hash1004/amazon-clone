"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_GRIND,
  DEFAULT_SIZE,
  isGrind,
  isSize,
  type Grind,
  type Size,
} from "@/lib/variants";

/**
 * One line per coffee *and* grind *and* size: 12 oz whole bean and 12 oz
 * espresso-ground of the same coffee are two lines, the way they're two
 * different bags on the shelf.
 */
export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
  quantity: number;
  grind: Grind;
  size: Size;
  /** Bag weight, for the "Whole bean · 12 oz" label. */
  grams?: number;
  /** Standard bags of stock one of these takes (see lib/variants). */
  units: number;
};

export function lineKey(l: Pick<CartLine, "productId" | "grind" | "size">): string {
  return `${l.productId}:${l.size}:${l.grind}`;
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  /** Re-grind a line; merges into an existing line for the same bag. */
  setGrind: (key: string, grind: Grind) => void;
  clear: () => void;
};

const STORAGE_KEY = "still-coffee.cart.v1";
const EVENT = "still-coffee:cart";

// ─── External store backed by localStorage ────────────────────────────────

let cachedRaw: string | null = null;
let cachedLines: CartLine[] = [];

function getSnapshot(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cachedLines;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedLines = Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    cachedLines = [];
  }
  return cachedLines;
}

/** Carts saved before grind/size existed hold one standard whole-bean bag per line. */
function normalize(l: Partial<CartLine>): CartLine {
  return {
    ...(l as CartLine),
    grind: isGrind(l.grind) ? l.grind : DEFAULT_GRIND,
    size: isSize(l.size) ? l.size : DEFAULT_SIZE,
    units: typeof l.units === "number" && l.units > 0 ? l.units : 1,
  };
}

const EMPTY: CartLine[] = [];
function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

function write(next: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode — fall back to in-memory for this tab
    cachedRaw = JSON.stringify(next);
    cachedLines = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

function mutate(fn: (lines: CartLine[]) => CartLine[]) {
  write(fn(getSnapshot()));
}

// ─── Context (thin wrapper so components just call useCart) ────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    mutate((prev) => {
      const key = lineKey(line);
      const existing = prev.find((l) => lineKey(l) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l) === key
            ? { ...l, quantity: Math.min(99, l.quantity + quantity) }
            : l,
        );
      }
      return [...prev, { ...line, quantity: Math.min(99, quantity) }];
    });
  }, []);

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    (key, quantity) => {
      mutate((prev) =>
        quantity <= 0
          ? prev.filter((l) => lineKey(l) !== key)
          : prev.map((l) =>
              lineKey(l) === key
                ? { ...l, quantity: Math.min(99, quantity) }
                : l,
            ),
      );
    },
    [],
  );

  const remove = useCallback<CartContextValue["remove"]>((key) => {
    mutate((prev) => prev.filter((l) => lineKey(l) !== key));
  }, []);

  const setGrind = useCallback<CartContextValue["setGrind"]>((key, grind) => {
    mutate((prev) => {
      const line = prev.find((l) => lineKey(l) === key);
      if (!line) return prev;
      const moved = { ...line, grind };
      const target = prev.find((l) => lineKey(l) === lineKey(moved));
      if (target && target !== line) {
        return prev
          .filter((l) => l !== line)
          .map((l) =>
            l === target ? { ...l, quantity: Math.min(99, l.quantity + line.quantity) } : l,
          );
      }
      return prev.map((l) => (l === line ? moved : l));
    });
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotalCents = lines.reduce(
      (n, l) => n + l.quantity * l.priceCents,
      0,
    );
    return { lines, count, subtotalCents, ready, add, setQuantity, remove, setGrind, clear };
  }, [lines, ready, add, setQuantity, remove, setGrind, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
