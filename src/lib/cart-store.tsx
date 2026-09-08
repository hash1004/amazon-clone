"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
const CartContext = createContext<CartContextValue | null>(null);

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* quota / private mode — cart stays in-memory for this session */
    }
  }, [lines, ready]);

  // Reflect changes made in other tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1) => {
    setLines((prev) => {
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
      setLines((prev) =>
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
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

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
