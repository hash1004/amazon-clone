import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-4 h-8 w-56" />
      <div className="rounded-lg border border-border-default bg-surface p-5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
      <div className="mt-4 flex gap-4 rounded-lg border border-border-default bg-surface p-4">
        <Skeleton className="h-20 w-20 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}
