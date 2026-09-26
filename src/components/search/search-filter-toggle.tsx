"use client";

import { FilterIcon, ChevronDownIcon } from "@/components/ui/icons";
import { useSearchFilter } from "@/components/search/search-filter-context";

export function SearchFilterToggle({ activeCount }: { activeCount: number }) {
  const { open, setOpen } = useSearchFilter();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary transition hover:text-text-accent"
    >
      <FilterIcon className="h-3.5 w-3.5" />
      Filters &amp; Sort
      {activeCount > 0 && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">
          {activeCount}
        </span>
      )}
      <ChevronDownIcon
        className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}
