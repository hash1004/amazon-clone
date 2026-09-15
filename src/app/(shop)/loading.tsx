import { Skeleton, ProductTileSkeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="border-b border-border-default">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-12 px-6 py-14 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
          <div className="flex max-w-[480px] flex-col gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="mt-2 h-11 w-36 rounded-pill" />
          </div>
          <Skeleton className="mx-auto h-[360px] w-[360px] shrink-0 rounded-[2rem]" />
        </div>
      </section>

      {/* Category sections */}
      {Array.from({ length: 2 }).map((_, s) => (
        <section key={s} className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10">
          <div className="mb-6 flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductTileSkeleton key={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
