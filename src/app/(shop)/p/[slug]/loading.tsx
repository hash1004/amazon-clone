import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="w-full bg-surface px-4 py-6 sm:px-8 lg:px-12">
      <Skeleton className="mb-4 h-3 w-40" />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="mt-3 flex gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-14 rounded-lg sm:h-16 sm:w-16" />
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="mt-3 h-4 w-32" />
          <Skeleton className="mt-4 h-8 w-28" />
          <Skeleton className="mt-2 h-4 w-56" />
          <Skeleton className="mt-5 h-12 w-full max-w-sm rounded-pill" />
          <Skeleton className="mt-6 h-4 w-40" />
          <Skeleton className="mt-2 h-16 w-full" />
          <Skeleton className="mt-6 h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
