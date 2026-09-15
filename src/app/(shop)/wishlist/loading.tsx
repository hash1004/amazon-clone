import { Skeleton, ProductTileSkeleton } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <Skeleton className="mb-4 h-8 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductTileSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
