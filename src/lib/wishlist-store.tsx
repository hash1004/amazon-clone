"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export type WishlistEntry = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
  listPriceCents: number | null;
  rating: number;
  ratingCount: number;
  inStock: boolean;
};

const KEY = "amazon-clone.wishlist.v1";
const EVENT = "amazon-clone:wishlist";

let cachedRaw: string | null = null;
let cached: WishlistEntry[] = [];

function read(): WishlistEntry[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const p = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(p) ? p : [];
  } catch {
    cached = [];
  }
  return cached;
}

const EMPTY: WishlistEntry[] = [];

function subscribe(cb: () => void) {
  const h = () => cb();
  const s = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, h);
  window.addEventListener("storage", s);
  return () => {
    window.removeEventListener(EVENT, h);
    window.removeEventListener("storage", s);
  };
}

function write(next: WishlistEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cachedRaw = JSON.stringify(next);
    cached = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

type Ctx = {
  items: WishlistEntry[];
  count: number;
  ready: boolean;
  has: (productId: string) => boolean;
  toggle: (entry: WishlistEntry) => void;
  remove: (productId: string) => void;
};

const WishlistContext = createContext<Ctx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const has = useCallback(
    (id: string) => read().some((e) => e.productId === id),
    [],
  );
  const toggle = useCallback((entry: WishlistEntry) => {
    const cur = read();
    write(
      cur.some((e) => e.productId === entry.productId)
        ? cur.filter((e) => e.productId !== entry.productId)
        : [entry, ...cur],
    );
  }, []);
  const remove = useCallback(
    (id: string) => write(read().filter((e) => e.productId !== id)),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ items, count: items.length, ready, has, toggle, remove }),
    [items, ready, has, toggle, remove],
  );
  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const c = useContext(WishlistContext);
  if (!c) throw new Error("useWishlist must be used within <WishlistProvider>");
  return c;
}
