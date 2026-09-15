import { Skeleton, ProductTileSkeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="bg-canvas">
      <div className="border-b border-border-default bg-surface">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-2">
          <div className="flex items-center gap-5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-4">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <ProductTileSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
