export type SearchParams = {
  q?: string;
  dept?: string;
  brand?: string;
  deals?: string;
  rating?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
};

/** Build a /s URL from the current params plus overrides (undefined clears a key). */
export function searchUrl(
  current: SearchParams,
  overrides: Partial<SearchParams>,
): string {
  const merged: SearchParams = { ...current, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== "" && v !== null) params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `/s?${s}` : "/s";
}

export const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Avg. customer review" },
  { key: "newest", label: "Newest arrivals" },
] as const;
