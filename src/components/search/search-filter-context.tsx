"use client";

import { createContext, useContext, useState } from "react";

const Ctx = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(
  null,
);

/** Shared open state between the toolbar's trigger button and the panel
 * that overlays the results section below it — they're not adjacent in
 * the tree (trigger sits in the toolbar row, panel overlays the grid
 * further down), so this is simpler than lifting the whole page into one
 * component. */
export function SearchFilterProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Ctx.Provider value={{ open, setOpen }}>{children}</Ctx.Provider>;
}

export function useSearchFilter() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSearchFilter must be used within SearchFilterProvider");
  return c;
}
