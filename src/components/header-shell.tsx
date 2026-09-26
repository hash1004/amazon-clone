/** Sticky header wrapper — pinned at the top always, no hide-on-scroll. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  return <div className="sticky top-0 z-40">{children}</div>;
}
