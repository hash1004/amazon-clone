/**
 * Relevance search over the catalog, used by both the results page (/s)
 * and the header suggestions API.
 *
 * The query is split into words and EVERY word has to match somewhere on
 * the product — title, origin, tasting notes, roast level, process or
 * description — in any order ("supremo colombia", "dark ethiopia",
 * "chocolate natural"). Each word can match a whole word, the start of a
 * word ("choc"), a piece inside a word, or be off by a typo or two
 * ("columbia", "etiopia", "yirgacheff"). Accents are ignored ("tarrazu").
 * A few taste words map onto the notes they describe ("fruity" → berry,
 * peach, citrus…).
 *
 * Scoring happens in memory, which is the right trade for a catalog of a
 * few dozen coffees: no Postgres extension to install, and fuzzy matching
 * that plain `ILIKE '%q%'` can't do. Revisit if the catalog grows into the
 * thousands.
 */

export type SearchableProduct = {
  title: string;
  origin: string;
  process: string;
  roastLevel: string;
  tastingNotes: string[];
  description: string;
};

export type SearchField = "title" | "origin" | "notes" | "roast" | "process" | "description";

export type SearchHit<T> = {
  product: T;
  score: number;
  /** Which fields matched at least one query word. */
  fields: Set<SearchField>;
};

const FIELD_WEIGHT: Record<SearchField, number> = {
  title: 5,
  origin: 4,
  notes: 3,
  roast: 3,
  process: 2,
  description: 1,
};

// Words that describe every product, so they'd match nothing useful — a
// query of just "coffee" should show everything, not nothing.
const STOPWORDS = new Set([
  "a", "an", "and", "the", "of", "with", "for", "in",
  "coffee", "coffees", "bean", "beans", "roast", "roasts", "roasted",
]);

// Taste words shoppers type that aren't literally in the tasting notes.
const SYNONYMS: Record<string, string[]> = {
  fruity: ["berry", "blueberry", "strawberry", "blackcurrant", "peach", "apple", "orange", "citrus", "cherry"],
  berry: ["blueberry", "strawberry", "blackcurrant"],
  nutty: ["almond", "walnut", "hazelnut", "pecan", "nut"],
  chocolatey: ["chocolate", "cocoa"],
  chocolaty: ["chocolate", "cocoa"],
  sweet: ["caramel", "sugar", "honey", "toffee"],
  floral: ["jasmine", "bergamot", "floral"],
  citrusy: ["citrus", "orange", "lemon", "bergamot"],
};

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function words(s: string): string[] {
  return normalize(s).split(/[^a-z0-9]+/).filter(Boolean);
}

export function queryTerms(q: string): string[] {
  return words(q).filter((w) => !STOPWORDS.has(w));
}

/** Damerau-Levenshtein distance with an early exit once it passes `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2 = new Array<number>(b.length + 1).fill(0);
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev);
    prev = cur;
  }
  return prev[b.length];
}

function typoBudget(term: string): number {
  if (term.length >= 7) return 2;
  if (term.length >= 4) return 1;
  return 0;
}

/** How well one query term matches one word of a field, 0..1. */
function termVsWord(term: string, word: string): number {
  if (word === term) return 1;
  if (term.length >= 2 && word.startsWith(term)) return 0.85;
  if (term.length >= 3 && word.includes(term)) return 0.5;
  const budget = typoBudget(term);
  if (budget > 0) {
    if (editDistance(term, word, budget) <= budget) return 0.7;
    // Typo in a word that's still being typed: "yirgach" vs "yirgacheffe".
    if (word.length > term.length && editDistance(term, word.slice(0, term.length), 1) <= 1) {
      return 0.55;
    }
  }
  return 0;
}

function termVsField(term: string, fieldWords: string[]): number {
  let best = 0;
  for (const w of fieldWords) {
    const s = termVsWord(term, w);
    if (s > best) best = s;
    if (best === 1) break;
  }
  return best;
}

type Indexed = Record<SearchField, string[]>;

function index(p: SearchableProduct): Indexed {
  return {
    title: words(p.title),
    origin: words(p.origin),
    notes: p.tastingNotes.flatMap(words),
    roast: words(p.roastLevel),
    process: words(p.process),
    description: words(p.description),
  };
}

/**
 * Products matching every query term, best first. An empty query (or one
 * made only of stopwords) matches everything with score 0.
 */
export function searchProducts<T extends SearchableProduct>(products: T[], q: string): SearchHit<T>[] {
  const terms = queryTerms(q);
  if (terms.length === 0) {
    return products.map((product) => ({ product, score: 0, fields: new Set<SearchField>() }));
  }
  const phrase = normalize(q).trim();

  const hits: SearchHit<T>[] = [];
  for (const product of products) {
    const idx = index(product);
    const fields = new Set<SearchField>();
    let score = 0;
    let allMatched = true;

    for (const term of terms) {
      const variants = [term, ...(SYNONYMS[term] ?? [])];
      let best = 0;
      let bestField: SearchField | null = null;
      for (const field of Object.keys(FIELD_WEIGHT) as SearchField[]) {
        let m = 0;
        for (const v of variants) {
          // Synonyms count a little less than the word actually typed.
          const s = termVsField(v, idx[field]) * (v === term ? 1 : 0.8);
          if (s > m) m = s;
        }
        if (m > 0) fields.add(field);
        const weighted = m * FIELD_WEIGHT[field];
        if (weighted > best) {
          best = weighted;
          bestField = field;
        }
      }
      if (!bestField) {
        allMatched = false;
        break;
      }
      score += best;
    }
    if (!allMatched) continue;

    // Whole query as typed appears in the title → float it to the top.
    if (phrase.length >= 3 && normalize(product.title).includes(phrase)) score += 5;
    hits.push({ product, score, fields });
  }

  return hits.sort((a, b) => b.score - a.score);
}
