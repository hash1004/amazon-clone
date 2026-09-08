export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4">
      <div className="h-3 w-64 animate-pulse rounded bg-border-default" />
      <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]">
        <div className="bg-surface p-4 shadow-sm">
          <div className="aspect-square w-full animate-pulse bg-border-default" />
        </div>
        <div className="space-y-3">
          <div className="h-7 w-full animate-pulse rounded bg-border-default" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-border-default" />
          <div className="h-8 w-1/4 animate-pulse rounded bg-border-default" />
          <div className="h-24 w-full animate-pulse rounded bg-border-default" />
        </div>
        <div className="h-52 animate-pulse rounded-lg bg-border-default" />
      </div>
    </div>
  );
}
