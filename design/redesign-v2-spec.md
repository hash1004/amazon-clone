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

## Revision — accent reverted to orange (post-review)

The first pass of this redesign used a deep forest green as the one accent.
User feedback after seeing it live across the whole app (not just the one
Home mockup screen): the green reads as an unrelated brand, not Amazon —
reverted to Amazon's own orange (v1's "Buy Now" `#ffa41c`). The **one-accent
architecture stays** (still a single source of truth, still used for CTAs,
links, and quiet discount indicators) — only the hue changed, hex table below
updated accordingly.

One nuance worth recording: the vivid button orange (`#ffa41c`) fails WCAG
text contrast on the light canvas (~2:1) — fine for a solid button fill with
dark text on top (the real "Buy Now" button's own convention), not usable as
link/body text. `--text-accent`/`--text-deal` use a darker rust shade of the
*same* hue (`#c1440e`, ~5:1 contrast) instead. Two shades of one accent, not
a second color — the green version had this same split, just green.

## Token system

One accent, not three. Amazon's yellow CTA / orange buy-now / teal link were
collapsed into a single considered accent (Amazon's own orange) used for
links, CTAs, and — this is the thesis made literal — **discount indicators**,
which no longer get a separate alarm-red "deal" color. A quiet deal looks
like the rest of the brand, not like a siren.

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
| `--chrome-search-btn` / hover | `#febd69` / `#f3a847` | `#ffa41c` / `#fa8900` | search submit uses the one accent |
| `--border-default` | `#d5d9d9` | `#dddbd5` | |
| `--border-strong` | `#8d9096` | `#a7a49c` | |
| `--border-accent` | `#e77600` | `#c1440e` | focus rings, active states — the darker (contrast-safe) shade |
| `--text-primary` | `#0f1111` | `#1f1d15` | warm ink, not cool black |
| `--text-secondary` | `#565959` | `#605d56` | |
| `--text-muted` | `#848688` | `#8b8982` | |
| `--text-accent` / hover | `#007185` / `#c7511f` | `#c1440e` / `#9e380b` | one accent for links too — darker rust shade for contrast |
| `--text-deal` | `#cc0c39` (alarm red) | `#c1440e` | **same as accent — the thesis** |
| `--accent-primary` / hover | `#ffd814` / `#f7ca00` | `#ffa41c` / `#fa8900` | CTA fill — v1's own "Buy Now" orange, dark text on top |
| `--accent-foreground` | `#0f1111` | `#1f1d15` | still dark-on-orange, same convention as v1 |
| `--accent-subtle` | `#fef3d0` | `#fff4e4` | badge/pill backgrounds |
| `--accent-buy` / hover | `#ffa41c` / `#fa8900` | `#ffa41c` / `#fa8900` | second CTA color retired, aliased to the one accent (same hex as before — it *was* this orange) |
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

## Header redesign (post-review, second pass)

Feedback on the first pass: the reskinned header still read as "Amazon,
recolored" — same deliver-to/language/search-bar/returns-and-orders shape as
the original, just new colors. Rebuilt as a genuinely different structure,
not a reskin, on explicit direction:

- **Three zones**: categories (left) — wordmark (center) — icons (right).
  Deliver-to, the language selector, and Returns & Orders are **dropped**,
  not relocated.
- **Left — `categories-menu.tsx`**: "Categories" trigger, hover-opens on
  desktop / tap-toggles on touch, flat list of the 5 departments. This
  replaces both the old nav belt and the old hamburger `MobileMenu` (deleted
  — categories-menu handles both desktop and mobile now). Nested/leaf
  categories (e.g. by brand within a department) are a later pass, not this
  one — flagged as a real gap, not silently faked.
- **Center**: `AmazonLogo`, unchanged from the first pass.
- **Right — four icons only**: `expanding-search.tsx` (icon that expands to
  an input on hover/focus, autocomplete kept, department selector dropped
  since categories live on the left now), `account-menu.tsx` (same dropdown
  content, trigger swapped from text to a person icon), `wishlist-badge.tsx`
  (new — wishlist had no header entry point before), `cart-badge.tsx`
  (text label and numeric count dropped for a pulsing dot — `ui/pulse-dot.tsx`
  — shared by cart and wishlist, non-empty state only, `motion-safe:` so it
  respects reduced-motion).
- Old `search-box.tsx` and `mobile-menu.tsx` deleted (fully superseded, no
  other callers).

## Explicitly out of scope this pass

No net-new features anywhere (no price-history charts, no compatibility
checkers). PDP, cart, checkout, orders, account, wishlist, auth keep their
exact current structure — only the token reskin + shared-component styling
(badges, buttons, logo) reaches them.
