"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "amazon-clone.cart.v1";
const EVENT = "amazon-clone:cart";

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
    cachedLines = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedLines = [];
  }
  return cachedLines;
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
      const existing = prev.find((l) => l.productId === line.productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === line.productId
            ? { ...l, quantity: Math.min(99, l.quantity + quantity) }
            : l,
        );
      }
      return [...prev, { ...line, quantity: Math.min(99, quantity) }];
    });
  }, []);

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    (productId, quantity) => {
      mutate((prev) =>
        quantity <= 0
          ? prev.filter((l) => l.productId !== productId)
          : prev.map((l) =>
              l.productId === productId
                ? { ...l, quantity: Math.min(99, quantity) }
                : l,
            ),
      );
    },
    [],
  );

  const remove = useCallback<CartContextValue["remove"]>((productId) => {
    mutate((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotalCents = lines.reduce(
      (n, l) => n + l.quantity * l.priceCents,
      0,
    );
    return { lines, count, subtotalCents, ready, add, setQuantity, remove, clear };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
