import { Skeleton, ProductTileSkeleton } from "@/components/ui/skeleton";

/** Skeleton block for the brown hero — the light default would glare on brown. */
function OnBrown({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[rgba(243,234,217,0.1)] ${className}`} />;
}

export default function HomeLoading() {
  return (
    <div className="pb-8">
      {/* Hero — same box as Spotlight (full first screen under the header,
          same grid and image sizing) so nothing jumps when it swaps in. */}
      <section className="grain flex min-h-[calc(100dvh-3.5rem)] flex-col bg-chrome-nav 3xl:min-h-0">
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-rows-[minmax(11rem,1fr)_auto] gap-4 px-6 py-6 sm:gap-8 sm:px-10 sm:py-10 lg:grid-cols-2 lg:grid-rows-none lg:items-center lg:gap-16 lg:py-12 3xl:py-20">
          <OnBrown className="w-full lg:order-2 lg:aspect-square lg:max-h-[calc(100dvh-3.5rem-6rem)] 3xl:max-h-none" />
          <div className="flex flex-col gap-3 lg:order-1">
            <OnBrown className="h-3 w-24" />
            <OnBrown className="h-9 w-4/5 sm:h-12 lg:h-14" />
            <OnBrown className="h-3 w-40" />
            <div className="mt-2 flex gap-2">
              <OnBrown className="h-6 w-16" />
              <OnBrown className="h-6 w-16" />
              <OnBrown className="h-6 w-16" />
            </div>
            <OnBrown className="mt-3 h-10 w-36 sm:h-12 sm:w-40" />
          </div>
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
