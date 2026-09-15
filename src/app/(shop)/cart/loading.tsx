import { Skeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-4 px-4 py-6 lg:grid-cols-[1fr_300px]">
      <div className="bg-surface p-4">
        <Skeleton className="h-8 w-48 border-b border-border-default pb-2" />
        <ul>
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex gap-4 border-b border-border-default py-4">
              <Skeleton className="h-24 w-24 shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-7 w-24" />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-fit bg-surface p-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-10 w-full rounded-pill" />
      </div>
    </div>
  );
}
