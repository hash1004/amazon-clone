/**
 * Flavor profile for the product page: acidity, body and sweetness on a
 * 1–5 scale. Cupping notes for each coffee, kept in code (keyed by slug)
 * rather than the database so they reach the live catalog with a normal
 * deploy, no reseed. A coffee without an entry falls back to its roast
 * level's typical profile.
 */

export type FlavorProfile = { acidity: number; body: number; sweetness: number };

const BY_SLUG: Record<string, FlavorProfile> = {
  "ethiopia-yirgacheffe": { acidity: 5, body: 2, sweetness: 3 },
  "kenya-nyeri-aa": { acidity: 5, body: 3, sweetness: 3 },
  "colombia-pink-bourbon": { acidity: 4, body: 3, sweetness: 4 },
  "ethiopia-guji-natural": { acidity: 4, body: 3, sweetness: 5 },
  "guatemala-huehuetenango": { acidity: 3, body: 3, sweetness: 4 },
  "costa-rica-tarraz": { acidity: 3, body: 3, sweetness: 5 },
  "costa-rica-tarrazu": { acidity: 3, body: 3, sweetness: 5 },
  "colombia-supremo": { acidity: 3, body: 3, sweetness: 3 },
  "honduras-marcala": { acidity: 3, body: 3, sweetness: 4 },
  "brazil-cerrado": { acidity: 2, body: 4, sweetness: 3 },
  "sumatra-mandheling": { acidity: 1, body: 5, sweetness: 2 },
  "house-espresso-blend": { acidity: 2, body: 5, sweetness: 3 },
  "french-roast": { acidity: 1, body: 5, sweetness: 1 },
};

const BY_ROAST: Record<"LIGHT" | "MEDIUM" | "DARK", FlavorProfile> = {
  LIGHT: { acidity: 4, body: 2, sweetness: 3 },
  MEDIUM: { acidity: 3, body: 3, sweetness: 4 },
  DARK: { acidity: 1, body: 5, sweetness: 2 },
};

export function flavorProfile(slug: string, roast: "LIGHT" | "MEDIUM" | "DARK"): FlavorProfile {
  return BY_SLUG[slug] ?? BY_ROAST[roast];
}

export const FLAVOR_AXES: { key: keyof FlavorProfile; label: string; low: string; high: string }[] = [
  { key: "acidity", label: "Acidity", low: "Mellow", high: "Bright" },
  { key: "body", label: "Body", low: "Light", high: "Full" },
  { key: "sweetness", label: "Sweetness", low: "Dry", high: "Sweet" },
];
