export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border-default ${className}`} />;
}

/** Matches product-card.tsx / category-section.tsx's card shape — reused
 * by every grid's loading.tsx so the skeleton doesn't jump when real
 * cards swap in. */
export function ProductTileSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg bg-surface p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-3 h-3 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-2 h-5 w-1/3" />
    </div>
  );
}
