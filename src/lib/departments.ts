export type Department = {
  slug: string;
  label: string;
  emoji: string;
};

export const DEPARTMENTS: Department[] = [
  { slug: "electronics", label: "Electronics", emoji: "🎧" },
  { slug: "home-kitchen", label: "Home & Kitchen", emoji: "🍳" },
  { slug: "fashion", label: "Fashion", emoji: "👟" },
  { slug: "beauty", label: "Beauty", emoji: "💄" },
  { slug: "sports-outdoors", label: "Sports & Outdoors", emoji: "🏀" },
];

export const DEPARTMENT_BY_SLUG = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.slug, d]),
) as Record<string, Department>;
