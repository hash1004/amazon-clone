# Redesign v2 — minimal/decluttered direction (8x resubmission)

Supersedes `amazon-replication-spec.md` (retired below), which specified
matching amazon.com's own crowded chrome pixel-for-pixel. That brief was
rejected: "don't present a clone that anyone can do... your own taste."

**Thesis**: amazon.com is too crowded. Replace colorful banner-everywhere
merchandising with a calm, considered layout that still surfaces
categorization and deals/offers — quietly (borders, restrained type, one
accent color) instead of loudly (banner carousels, poster-tile grids, a
red "DEAL" ribbon on every third card, a navy "#1 Bestseller" chip).

Source: Home mockup (Claude Design canvas, "Amazon Redesign - Home"),
extracted from its `Main.dc.html` artboard. Full source saved at
`design/redesign-v2-mockup-source.html` for reference.

## Scope (confirmed)

- **Home + Search**: deep restructure. Modules reorganized, some cut/merged.
- **Everything else** (PDP, cart, checkout, orders, account, wishlist, auth,
  header/footer chrome): **reskin only** — new tokens + shared components,
  same structure, same features. Nothing is removed from these flows.
- Header/footer keep every existing feature (deliver-to, language selector,
  department belt, returns & orders, account menu) — only their *skin*
  (color, logo mark, button treatment) changes to the new system. The
  mockup's header is visually sparser than this because it's a one-screen
  direction check, not a literal header spec.

## Token system

One accent, not three. Amazon's yellow CTA / orange buy-now / teal link were
collapsed into a single considered accent (deep forest green) used for links,
CTAs, and — this is the thesis made literal — **discount indicators**, which
no longer get a separate alarm-red "deal" color. A quiet deal looks like the
rest of the brand, not like a siren.

| Token | Old (v1) | New (v2) | Note |
|---|---|---|---|
| `--bg-canvas` | `#eaeded` | `#f8f7f2` | warm cream, not cool gray |
| `--bg-surface` / `--bg-elevated` | `#ffffff` | `#fefdfb` | near-white, warm |
| `--bg-subtle` | `#f7fafa` | `#f2f0ea` | sunken panels, image tiles |
| `--bg-inverse` | `#0f1111` | `#16140e` | |
| `--chrome-nav` | `#131921` (navy) | `#fefdfb` (light) | header top bar is now light |
| `--chrome-belt` | `#232f3e` (steel) | `#f2f0ea` | nav belt / footer link bar |
| `--chrome-belt-hover` | `#37475a` | `#e2e0d8` | |
| `--chrome-footer-deep` | `#131a22` | `#16140e` | footer copyright band, kept dark for contrast |
| `--chrome-search-btn` / hover | `#febd69` / `#f3a847` | `#284c32` / `#183b23` | search submit uses the one accent, not amber |
| `--border-default` | `#d5d9d9` | `#dddbd5` | |
| `--border-strong` | `#8d9096` | `#a7a49c` | |
| `--border-accent` | `#e77600` | `#284c32` | focus rings, active states |
| `--text-primary` | `#0f1111` | `#1f1d15` | warm ink, not cool black |
| `--text-secondary` | `#565959` | `#605d56` | |
| `--text-muted` | `#848688` | `#8b8982` | |
| `--text-accent` / hover | `#007185` / `#c7511f` | `#284c32` / `#12361e` | one accent for links too |
| `--text-deal` | `#cc0c39` (alarm red) | `#284c32` | **same as accent — the thesis** |
| `--accent-primary` / hover / active | `#ffd814` / `#f7ca00` / — | `#284c32` / `#183b23` / `#0a2f17` | CTA fill; text goes light-on-dark now, not dark-on-yellow |
| `--accent-foreground` | `#0f1111` | `#faf8f4` | inverse (was dark-on-yellow, now light-on-green) |
| `--accent-subtle` | `#fef3d0` | `#def1e2` | badge/pill backgrounds |
| `--accent-buy` / hover | `#ffa41c` / `#fa8900` | `#284c32` / `#183b23` | second CTA color retired, aliased to the one accent |
| `--status-success` | `#007600` | `#165626` | |
| `--status-warning` | `#b12704` | `#9a6500` | amber, not red-orange |
| `--status-danger` | `#c40000` | `#a12f2f` | kept genuinely distinct from the accent — real errors still read as errors |
| `--status-info` | `#007185` | `#345a73` | |
| *(all `-subtle` variants)* | bright tints | desaturated warm-neutral tints | |
| `--radius-*` | 4/8/12/16/pill | **unchanged** | mockup's card radius (12) and thumb radius (8) already matched |
| `--shadow-sm/md/lg` | `rgba(15,17,17,.08/.12/.16)` | `rgba(31,29,21,.05/.07/.10)` | quieter elevation everywhere; Home's own new modules skip shadow entirely and use a 1px border instead (per mockup) |

## Typography

- Body/UI: **Work Sans** (400/500/600) — replaces Inter-as-Ember-substitute.
- Display/logo: **Newsreader**, italic 500 — wordmark and Home's H1 only.
  Exposed as `font-serif` via `--font-serif` in `@theme inline`.
- Logo mark: `AmazonLogo` drops the orange smile-swoosh SVG for a plain
  italic serif "amazon" wordmark (`tone` prop kept, now just switches
  ink vs. inverse text color via tokens instead of a hardcoded hex per tone).

## Home page — module decisions

Replaces: auto-rotating hero carousel (`home-hero.tsx`) + quad poster-tile
grid (`poster-card.tsx`) + horizontally-scrolling themed rails
(`product-rail.tsx`, "Today's Deals" / "Best Sellers" / "New Arrivals" /
"Top Rated" / 5× "More to explore in X" — 9 rails deep on one page).

With, per the mockup:

1. **Spotlight** (`home/spotlight.tsx`) — one static two-column section:
   editorial headline + one-line stated opinion + CTA on the left, one real
   featured product (image, price, discount, rating) on the right. No
   auto-rotation, no carousel arrows/dots, no banner graphic — a considered
   single pick instead of a dozen competing for attention.
2. **Category sections** (`home/category-section.tsx`) — one static 4-up
   grid per department (title + "See all", reusing `DEPARTMENTS`), not a
   horizontally-scrolling rail. Discounts show inline on the card (quiet
   accent pill next to the price) instead of a separate deals rail with a
   red ribbon. Bestseller rank chips (navy `#N` badge) are cut — rating +
   review count is the quiet signal instead.
3. Net effect: **9 modules → 3** (spotlight + 2 category sections shown;
   remaining departments render as further category sections, still fewer
   and calmer than the old rail stack). No products are hidden — same data,
   reorganized, not cut. `RecentlyViewedRow` and the signed-out CTA panel
   stay (existing features, reskinned only).

## Search page — decisions

Search's clutter wasn't structural (no carousel/banner to remove) — it's
already a faceted filter-rail + grid layout. Its restructure is disciplined
restraint, not a rebuild:

- Discount treatment matches Home: quiet accent pill, not a bold red
  corner ribbon (`ProductCard`, shared with PDP — this is a reskin change
  there, same DOM position, just quieter color).
- `ChoiceBadge` / `OverallPickBadge` (navy chip) restyled to the accent-soft
  pill treatment, same placement.
- Tightened redundant copy ("Check each product page for other buying
  options" filler line removed); heading now sets `font-serif` to tie back
  to the Home display type.
- Filter rail / sort / pagination structure unchanged — already minimal.

## Explicitly out of scope this pass

No net-new features anywhere (no price-history charts, no compatibility
checkers). PDP, cart, checkout, orders, account, wishlist, auth keep their
exact current structure — only the token reskin + shared-component styling
(badges, buttons, logo) reaches them.
