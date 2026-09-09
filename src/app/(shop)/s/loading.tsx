export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-4">
      <div className="h-6 w-48 animate-pulse rounded bg-border-default" />
      <div className="mt-4 flex gap-6">
        <div className="hidden w-48 shrink-0 space-y-2 lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full animate-pulse rounded bg-border-default"
            />
          ))}
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-surface p-4 shadow-sm">
              <div className="aspect-square w-full animate-pulse bg-border-default" />
              <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-border-default" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-border-default" />
              <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-border-default" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
