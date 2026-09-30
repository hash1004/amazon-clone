import type { Grind } from "@/lib/variants";

/**
 * Brew recipes, one per method in the product page's brew guide. Starting
 * points, not rules: each has a base recipe plus how to nudge it for the
 * roast level, and the grind option to buy if you don't grind at home.
 */
export type Roast = "LIGHT" | "MEDIUM" | "DARK";

export type BrewGuide = {
  slug: string;
  name: string;
  summary: string;
  /** The grind option on the product page that suits this method. */
  grind: Grind;
  grindDescription: string;
  dose: string;
  water: string;
  ratio: string;
  temperature: string;
  time: string;
  equipment: string[];
  steps: string[];
  byRoast: Partial<Record<Roast, string>>;
  /** Roasts we'd reach for first with this method. */
  suits: Roast[];
};

export const BREW_GUIDES: BrewGuide[] = [
  {
    slug: "pour-over",
    name: "Pour-over",
    summary: "A clean, bright cup that shows off light and medium roasts. V60, Kalita or Chemex.",
    grind: "filter",
    grindDescription: "Medium-fine, like table salt",
    dose: "20 g coffee",
    water: "320 g water",
    ratio: "1:16",
    temperature: "200–205 °F (93–96 °C)",
    time: "3:00–3:30",
    equipment: ["Pour-over dripper and paper filter", "Kettle (gooseneck helps)", "Scale", "Timer"],
    steps: [
      "Rinse the paper filter with hot water and tip the rinse water out. This warms the dripper and removes papery taste.",
      "Add 20 g of coffee and shake it level.",
      "Bloom: pour 50 g of water to wet all the grounds and wait 30–45 seconds while it bubbles.",
      "Pour slowly in circles, staying off the paper, to 200 g by 1:15.",
      "Keep pouring gently to 320 g by about 2:00.",
      "Let it drain. It should finish between 3:00 and 3:30. Swirl and serve.",
    ],
    byRoast: {
      LIGHT: "Go to the hotter end (205 °F) and a slightly finer grind so the fruit and florals come through.",
      MEDIUM: "Try 1:15 for a little more body and sweetness.",
      DARK: "Drop to 195 °F and grind a touch coarser to avoid bitterness.",
    },
    suits: ["LIGHT", "MEDIUM"],
  },
  {
    slug: "drip",
    name: "Drip machine",
    summary: "Hands-off and dependable. Good coffee in, good coffee out.",
    grind: "filter",
    grindDescription: "Medium, like coarse sand",
    dose: "55 g coffee",
    water: "940 g water (about 4 mugs)",
    ratio: "1:17",
    temperature: "Machine default",
    time: "About 5:00",
    equipment: ["Drip coffee maker", "Paper filter", "Scale or tablespoon (about 5 g each)"],
    steps: [
      "Fill the reservoir with fresh, cold water.",
      "Rinse the paper filter if your machine allows, then add the coffee and level it.",
      "Start the brew. Don't pause it mid-cycle to pour a cup, or the rest of the pot comes out weak.",
      "Give the pot a stir before pouring. The first and last drips are very different strengths.",
      "Serve within 30 minutes; a hot plate cooks the flavor. A thermal carafe keeps it better.",
    ],
    byRoast: {
      LIGHT: "Use 1:16 (a little more coffee); drip machines often run cool for light roasts.",
      DARK: "1:17 or even 1:18 keeps dark roasts smooth rather than harsh.",
    },
    suits: ["MEDIUM", "LIGHT"],
  },
  {
    slug: "aeropress",
    name: "AeroPress",
    summary: "Quick, forgiving and easy to clean. A bright, full cup for one.",
    grind: "filter",
    grindDescription: "Fine to medium-fine",
    dose: "15 g coffee",
    water: "210 g water",
    ratio: "1:14",
    temperature: "185–200 °F (85–93 °C)",
    time: "2:00",
    equipment: ["AeroPress with paper filter", "Kettle", "Scale", "Sturdy mug"],
    steps: [
      "Put a paper filter in the cap and rinse it. Assemble the AeroPress upright on your mug.",
      "Add 15 g of coffee.",
      "Pour 210 g of water, making sure all the grounds are wet.",
      "Stir three times, then insert the plunger just enough to stop the drip.",
      "At 1:30, give it a gentle swirl.",
      "At 2:00, press slowly for about 30 seconds. Stop when you hear a hiss.",
    ],
    byRoast: {
      LIGHT: "Use the hotter end (200 °F) and a finer grind.",
      DARK: "185 °F is plenty; hotter water pulls bitterness from dark roasts.",
    },
    suits: ["LIGHT", "MEDIUM"],
  },
  {
    slug: "french-press",
    name: "French press",
    summary: "Heavy body and rich texture. Great for medium and dark roasts, and for cold brew.",
    grind: "french-press",
    grindDescription: "Coarse, like sea salt",
    dose: "30 g coffee",
    water: "450 g water",
    ratio: "1:15",
    temperature: "200–205 °F (93–96 °C)",
    time: "4:00",
    equipment: ["French press", "Kettle", "Scale", "Spoon"],
    steps: [
      "Warm the press with hot water and tip it out.",
      "Add 30 g of coarse coffee and pour in 450 g of water.",
      "Put the lid on (plunger up) and wait 4 minutes.",
      "Break the crust on top with a spoon and skim off the foam.",
      "Press gently, just to the top of the coffee. Pushing to the bottom stirs up silt.",
      "Pour it all out now, into cups or a carafe. Left in the press, it keeps brewing and turns bitter.",
    ],
    byRoast: {
      MEDIUM: "1:15 is the sweet spot for chocolate and nut notes.",
      DARK: "Use 1:14 for a bolder cup, or 1:8 steeped 12–16 hours in the fridge for cold brew concentrate.",
    },
    suits: ["MEDIUM", "DARK"],
  },
  {
    slug: "espresso",
    name: "Espresso",
    summary: "Concentrated and syrupy, and the base for lattes and flat whites.",
    grind: "espresso",
    grindDescription: "Fine, like powdered sugar",
    dose: "18 g coffee",
    water: "36 g espresso out",
    ratio: "1:2",
    temperature: "198–201 °F (92–94 °C)",
    time: "25–30 seconds",
    equipment: ["Espresso machine", "Tamper", "Scale that fits under the cup"],
    steps: [
      "Flush the group head for a couple of seconds to clear old coffee and stabilize temperature.",
      "Dose 18 g into a dry basket, level it and tamp firmly and evenly.",
      "Lock in and start the shot straight away.",
      "Stop at 36 g in the cup. That should take 25–30 seconds.",
      "Too fast and sour? Grind finer. Too slow and bitter? Grind coarser. Change one thing at a time.",
    ],
    byRoast: {
      MEDIUM: "Try a slightly longer shot (1:2.2) to open up sweetness.",
      DARK: "Keep to 1:2 and the cooler end (198 °F) for chocolate without smoke.",
    },
    suits: ["DARK", "MEDIUM"],
  },
  {
    slug: "moka-pot",
    name: "Moka pot",
    summary: "Strong, stovetop coffee close to espresso, no machine needed.",
    grind: "espresso",
    grindDescription: "Fine, a little coarser than espresso",
    dose: "About 20 g (fill the basket level)",
    water: "Hot water to just below the valve",
    ratio: "About 1:10",
    temperature: "Start with just-boiled water",
    time: "4:00–5:00",
    equipment: ["Moka pot", "Kettle", "Stove"],
    steps: [
      "Fill the bottom chamber with just-boiled water up to just below the valve. Starting hot means less time scorching on the stove.",
      "Fill the basket with coffee and level it with a finger. Don't tamp.",
      "Screw it together (use a towel, it's hot) and put it on medium-low heat with the lid open.",
      "When coffee starts to flow, turn the heat down. You want a steady honey-like stream.",
      "Take it off the heat as soon as it starts to sputter, and run the base under cold water to stop it brewing.",
    ],
    byRoast: {
      DARK: "The classic match. Serve as is, or top up with hot water or milk.",
      MEDIUM: "Works well too, with a little more fruit and less smoke.",
    },
    suits: ["DARK", "MEDIUM"],
  },
];

const BY_NAME: Record<string, string> = {
  "pour-over": "pour-over",
  drip: "drip",
  aeropress: "aeropress",
  "french press": "french-press",
  espresso: "espresso",
  "moka pot": "moka-pot",
};

/** "French press" (as the brew guide table names it) → its recipe slug. */
export function brewSlugFor(method: string): string | undefined {
  return BY_NAME[method.toLowerCase()];
}

export function brewGuide(slug: string): BrewGuide | undefined {
  return BREW_GUIDES.find((g) => g.slug === slug);
}
