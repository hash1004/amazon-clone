"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type ViewedEntry = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  priceCents: number;
};

const KEY = "amazon-clone.viewed.v1";
const EVENT = "amazon-clone:viewed";
const MAX = 15;

let cachedRaw: string | null = null;
let cached: ViewedEntry[] = [];

function read(): ViewedEntry[] {
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

const EMPTY: ViewedEntry[] = [];

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

function push(entry: ViewedEntry) {
  const cur = read().filter((e) => e.productId !== entry.productId);
  const next = [entry, ...cur].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cachedRaw = JSON.stringify(next);
    cached = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

const Ctx = createContext<{ items: ViewedEntry[]; record: (e: ViewedEntry) => void } | null>(
  null,
);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const record = useCallback((e: ViewedEntry) => push(e), []);
  const value = useMemo(() => ({ items, record }), [items, record]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRecentlyViewed() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRecentlyViewed must be used within provider");
  return c;
}

/** Drop-in for product pages: records the product on mount. */
export function RecordView({ entry }: { entry: ViewedEntry }) {
  const { record } = useRecentlyViewed();
  useEffect(() => {
    record(entry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.productId]);
  return null;
}
