"use client";

import { useRouter } from "next/navigation";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";
import { ChevronDownIcon } from "@/components/ui/icons";

export function SortSelect({ params }: { params: SearchParams }) {
  const router = useRouter();
  return (
    <label className="relative flex items-center gap-1.5 text-sm text-text-primary transition hover:text-text-accent">
      <span className="text-text-secondary">Sort:</span>
      <select
        value={params.sort ?? "featured"}
        onChange={(e) =>
          router.push(
            searchUrl(params, { sort: e.target.value, page: undefined }),
          )
        }
        className="appearance-none bg-transparent pr-4 text-sm font-medium outline-none"
      >
        {SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-0 h-3 w-3" />
    </label>
  );
}
