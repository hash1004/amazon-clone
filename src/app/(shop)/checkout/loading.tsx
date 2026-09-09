export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-border-default" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-border-default/70" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-border-default/70" />
      </div>
    </div>
  );
}
