"use client";

import { useRouter } from "next/navigation";
import { searchUrl, SORTS, type SearchParams } from "@/lib/search-query";

export function SortSelect({ params }: { params: SearchParams }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-text-secondary">Sort by:</span>
      <select
        value={params.sort ?? "featured"}
        onChange={(e) =>
          router.push(
            searchUrl(params, { sort: e.target.value, page: undefined }),
          )
        }
        className="rounded-md border border-border-strong bg-subtle px-2 py-1.5 text-sm"
      >
        {SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
