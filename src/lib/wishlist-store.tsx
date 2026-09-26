"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loadWishlist, setSaved } from "@/lib/wishlist-actions";

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

// Where Saved Beans lived before they moved to the account. Read once after
// sign-in, merged into the account, then cleared.
const LEGACY_KEY = "still-coffee.wishlist.v1";

function takeLegacyIds(): string[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((e) => (e as Partial<WishlistEntry>)?.productId).filter((id): id is string => !!id)
      : [];
  } catch {
    return [];
  }
}

function clearLegacy() {
  try {
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Storage blocked — nothing to clear.
  }
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

/**
 * Saved Beans, stored on the account (see wishlist-actions). Changes show
 * immediately and save in the background; a failed save is rolled back.
 * `userId` comes from the server session, so signing in, out or as someone
 * else reloads it — and a list loaded for one user is never shown to another.
 */
export function WishlistProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const [loaded, setLoaded] = useState<{ userId: string; items: WishlistEntry[] } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const legacy = takeLegacyIds();
    loadWishlist(legacy)
      .then((list) => {
        if (cancelled) return;
        if (legacy.length > 0) clearLegacy();
        setLoaded({ userId, items: list ?? [] });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ userId, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const current = userId && loaded?.userId === userId ? loaded : null;
  const items = useMemo(() => current?.items ?? [], [current]);
  const ready = !userId || current !== null;

  const setItems = useCallback(
    (next: WishlistEntry[]) => userId && setLoaded({ userId, items: next }),
    [userId],
  );

  const persist = useCallback(
    (productId: string, saved: boolean, rollback: WishlistEntry[]) => {
      setSaved(productId, saved)
        .then((r) => {
          if (!r.ok) setItems(rollback);
        })
        .catch(() => setItems(rollback));
    },
    [setItems],
  );

  const has = useCallback((id: string) => items.some((e) => e.productId === id), [items]);

  const toggle = useCallback(
    (entry: WishlistEntry) => {
      const saved = items.some((e) => e.productId === entry.productId);
      setItems(saved ? items.filter((e) => e.productId !== entry.productId) : [entry, ...items]);
      persist(entry.productId, !saved, items);
    },
    [items, setItems, persist],
  );

  const remove = useCallback(
    (id: string) => {
      setItems(items.filter((e) => e.productId !== id));
      persist(id, false, items);
    },
    [items, setItems, persist],
  );

  const value = useMemo<Ctx>(
    () => ({ items, count: items.length, ready, has, toggle, remove }),
    [items, ready, has, toggle, remove],
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const c = useContext(WishlistContext);
  if (!c) throw new Error("useWishlist must be used within <WishlistProvider>");
  return c;
}
