import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <Skeleton className="mb-4 h-8 w-40" />
      <Skeleton className="mb-4 h-4 w-56" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-surface p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-4 w-20" />
    </div>
  );
}
