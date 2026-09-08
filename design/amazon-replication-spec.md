# Home screen — replicate amazon.com closely

Reference: 4 screenshots of the real amazon.com logged-out home page (desktop,
~2560px wide), provided 2026-09-08. Drop the PNGs in `design/screenshots/`
(`home-01-top.png` … `home-04-footer.png`) to keep them with the repo.

Goal: the home page + global header + footer should read as amazon.com at a
glance. We have ~194 products across 5 departments (electronics, home-kitchen,
fashion, beauty, sports-outdoors) from DummyJSON — populate every module from
that data; where the real site has copy we can't source (e.g. "under $25"),
derive it (price buckets) or substitute a plausible label.

---

## 1. Global header (all pages)

**Top bar** — background `#131921`, white text, ~60px tall, contents in a
max-width row, small gaps, each hoverable cell gets a 1px white border on hover.

| Cell | Detail |
|---|---|
| Logo | "amazon" wordmark + smile swoosh in `#ff9900`. Ours: `amazon` + `.clone` in orange. |
| Deliver to | pin glyph, small "Deliver to" over bold "United States" |
| Search | left dropdown "All ▾" (grey `#f3f3f3` bg) · flex-1 input `Search Amazon` · button `#febd69`→hover `#f3a847`, dark magnifier glyph. Whole thing rounded 4px; focus = 3px `#ff9900` glow |
| Language | small flag + `EN ▾` |
| Account | small "Hello, sign in" over bold "Account & Lists ▾" |
| Orders | small "Returns" over bold "& Orders" |
| Cart | cart glyph with **count badge in `#f08804`** overlapping top-right, "Cart" label bottom-aligned |

**Nav belt** — background `#232f3e`, hover `#37475a`, ~39px, white text ~14px:
`≡ All` (bold, hamburger) then: `Today's Deals`, `Customer Service`,
`Prime Video`, `Gift Cards`, `Sell`, `Registry`. Ours: keep `≡ All` +
`Today's Deals` + our 5 department names. Right side can fade to a promo slot.

Mobile: search moves to its own full-width row (already done). `≡ All` opens a
drawer with departments.

---

## 2. Hero carousel

- Full-bleed, ~600px tall on desktop, sits **under** the nav belt.
- Rotating slides; big left/right chevron buttons (`‹ ›`) vertically centered,
  semi-transparent, on hover show a faint border.
- Slide = flat pastel background (mint green in the shot) + large lifestyle
  product cutouts + a short headline ("Toys for little ones").
- The page's grey content area **overlaps the bottom ~300px of the hero** — the
  first row of white cards sits on top of the hero image (negative margin).
- A thin white "You are on amazon.com…" notification strip floats near the
  bottom of the hero.

Ours: 3–4 slides keyed to departments (e.g. "Top tech picks", "Refresh your
kitchen", "Beauty best sellers"), pastel bg per slide, headline + "Shop now"
link to `/s?dept=…`. Static cutout = top product image for that dept.

---

## 3. Content grid — the signature Amazon look

Grey page background `#e3e6e6`. White cards, no border, ~2px shadow, ~20px
inner padding, ~16px gap. Card title: bold ~21px `#0f1111`. Card footer link:
`#007185`, hover underline + `#c7511f`.

Layout = **alternating bands**:

### 3a. Row of 4 "poster" cards (grid: 4 / 2 / 1 columns)

Three sub-types, mixed within a row:

- **Quad** — title, then 2×2 grid of image tiles each with a small caption
  under it ("Jeans under $50"), then footer link ("See all deals").
- **Single** — title, one large image filling the card, footer link
  ("Shop gaming").
- **1 + 3** — title, one large captioned image, then a 3-up strip of small
  captioned images, footer link ("Explore all products in Kitchen").

Card examples from the shots (build equivalents from our data):
`Shop Fashion for less`, `Get your game on`, `Must-haves for every student`,
`Top categories in Kitchen appliances`, `Toys for all ages`,
`Level up your PC here`, `Level up your beauty routine`,
`Have more fun with family`, `Gear up to get fit`, `Elevate your Electronics`.

Our mapping: card = a department or a slice of one. Quad tiles = 4 top products
or 4 price buckets (`Under $10`, `Under $25`, `Under $50`, `Under $100`)
linking to `/s?dept=X&max=…`.

### 3b. Full-width "Best Sellers" horizontal scroller

Own white card, spans the full content width. Title `Best Sellers in
{Department}` / `New arrivals in {Department}`. A single horizontal row of
**bare product images** (no caption, no price, ~180px sq), clipped to the card,
with `‹ ›` chevrons that scroll. Each image links to the product.

Pattern down the page (from the shots):
```
[4 poster cards]
Best Sellers in Sports & Outdoors        (scroller)
Best Sellers in Computers & Accessories  (scroller)
[4 poster cards]
Best Sellers in Home & Kitchen           (scroller)
Best Sellers in Kitchen & Dining         (scroller)
[4 poster cards]
Best Sellers in Books                    (scroller)   <- we have no books; use another dept
Best Sellers in Beauty & Personal Care   (scroller)
[4 poster cards]
Top picks for you                        (scroller)
```
Ours: one scroller per department (5), interleaved with 2–3 poster-card rows
built from the same departments.

### 3c. Sign-in CTA card (near bottom, above footer)

Centered white card: bold `See personalized recommendations`, a yellow
`#ffd814` pill `Sign in` (→ `/login`), small `New customer? Start here.` (→
`/signup`). Hide entirely when logged in.

---

## 4. Footer

1. **Back to top** — full-width `#37475a` bar, centered white "Back to top",
   scrolls to top.
2. **Link columns** — `#232f3e`, 4 columns, white bold headings + grey links:
   `Get to Know Us` · `Make Money with Us` · `Amazon Payment Products` ·
   `Let Us Help You`. Use plausible links; wire the real ones (`Your Account`
   → `/account`, `Your Orders` → `/account/orders`, `Conditions of Use` → `#`).
3. **Locale row** — `#131a22`, centered: amazon logo, then pill buttons
   `English ▾`, `$ USD ▾` (real site shows currency), `🇺🇸 United States ▾`
   (non-functional, decorative).
4. **Sub-brand mega grid** — `#131a22`, tiny 6–7 column grid of
   `Name / one-line desc` (Amazon Music, Amazon Ads, 6pm, AbeBooks, …).
   Decorative; can be a static list.
5. **Legal bar** — centered tiny links `Conditions of Use`, `Privacy Notice`,
   … then `© 1996–2026, Amazon.com clone — not affiliated with Amazon`.

---

## Build order

1. New `SiteHeader` structure (dropdown "All", language, account caret) — visual only.
2. `HomeHero` carousel (client, auto-rotate + chevrons + overlap).
3. `PosterCard` (3 variants) + `BestSellerScroller` components.
4. New `page.tsx` composing hero → alternating poster rows / scrollers → sign-in CTA.
5. New `SiteFooter` (5 tiers).
6. Data helpers: per-department top products, price-bucket links (`max` param
   on `/s`), "best sellers" = order by `ratingCount desc`.

## Tokens to add

- `--chrome-search-btn: #febd69` / hover `#f3a847`
- `--chrome-footer-deep: #131a22`
- page grey stays `--bg-canvas: #eaeded` (close enough to `#e3e6e6`)

---

# Search results page — replicate closely

Reference: 1 screenshot of `amazon.com/s?k=gaming` (provided 2026-09-08 — save
as `design/screenshots/search-01.png`).

## Results header bar
Thin row under the nav belt, white bg, bottom border `#d5d9d9`:
- Left: `1-48 of over 100,000 results for "gaming"` — the query term in bold
  `#c45500`. (Ours: `1-24 of N results for "…"` or `… results in {Department}`.)
- Right: **`Sort by: Featured ▾`** rendered as a real bordered `<select>`
  (`#f0f2f2` bg, `#d5d9d9` border, rounded 8px). Options: Featured, Price: Low
  to High, Price: High to Low, Avg. Customer Review, Newest Arrivals.

## Left filter rail (~240px, hidden below lg)
Stacked sections, each: bold `#0f1111` ~14px heading, then links/checkboxes
~14px, `#565959` label, `~6px` row height. Divider between sections.

| Section | Content | Our data source |
|---|---|---|
| Popular Shopping Ideas | plain text links (Chair, Keyboard & Mouse…) | top departments / static |
| Deals & Discounts | "All Discounts" link → `?deals=1` | `listPriceCents != null` |
| Customer Reviews | `★★★★☆ & Up` (stars, clickable) → `?rating=4` | `rating >= 4` |
| Brands | checkbox list from the result set + "See more" | `groupBy brand` on current filter, top ~8 |
| Price | `$0–25` `$25–50` `$50–100` `$100+` radio → `?min=&max=` | `priceCents` range |
| Condition | New / Renewed / Used (decorative — all "New") | — |
| Seller | "Amazon clone" (decorative) | — |

Selected facets show with a bold label / filled checkbox; clearing returns to
base query. Keep existing `dept` rail behavior, restyled to match.

## Result card (grid: 5 / 3 / 2 columns, no card border, ~24px gap)
- Square image area (~300px), `object-contain`, white; hover title → `#c7511f`.
- Optional dark badge top-left: `Amazon's Choice` / `Overall Pick` (for
  `featured` items). Small `Sponsored ⓘ` grey above the title for a
  pseudo-random ~15% of items (purely cosmetic).
- Title: up to 4 lines, `#0f1111`, links to PDP.
- Rating row: orange stars + `(count)` in `#007185` with a `▾`.
- `2K+ bought in past month` — grey `#565959` ~12px (derive from `ratingCount`:
  e.g. `>500 → "1K+ bought"`, else omit).
- Price block: `-{pct}%` red then big price (superscript `$`/cents), then
  `List: $X` strikethrough `#565959`.
- Delivery line: `FREE delivery {date}` grey (static "+3 business days").
- **`Add to cart`** — yellow `#ffd814` pill, full card width, wired to the
  guest cart (no navigation).
- Empty state unchanged.

Pagination: keep Prev / `Page x of y` / Next, centered, restyled as bordered
buttons.

---

# Product detail page — replicate closely

Reference: 2 screenshots of a real PDP (`.../New-Sceptre-Curved-27-inch…`,
provided 2026-09-08 — save as `design/screenshots/pdp-01.png`,
`pdp-02.png`). We already have gallery + info + buy box; this tightens it.

## Layout
Breadcrumb (grey `#565959` ~12px): `Electronics › Computers & Accessories ›
Monitors` — ours: `{Department} › {brand}`.

3 columns: `[gallery ~40%] [info flex] [buy box 300px]`, stacking to 1 on
mobile.

## Gallery (left)
- Vertical thumbnail strip (~40px, rounded 8px, `#e7e7e7` border; **active +
  hover** → `#e77600` border + subtle ring). Hovering a thumb swaps the main
  image (already done).
- Large main image, `object-contain`, ~460px.
- `Click to see full view` blue link + a share glyph top-right.
- Nice-to-have: hover-zoom panel to the right (skip if time-boxed).

## Info column (middle)
- Title ~24px **normal weight** (not black), `#0f1111`.
- `Visit the {brand} Store` — `#007185` link (→ `/s?q={brand}`).
- Rating stars + `(count) ▾` + ` {rating} out of 5`.
- Badge: `Amazon's Choice` (teal-black pill) when `featured`, else nothing.
- `2K+ bought in past month` grey (same derivation as search card).
- divider `#e3e6e6`.
- Price: `-{pct}%` in `#cc0c39` + large price; `List Price: $X` strikethrough.
- **Spec table** (new) — 2-col key/value, bold `#0f1111` keys, `#565959`
  values, row divider `#f0f0f0`:
  `Brand`, `Department`, `Rating`, `In stock`, `Ships from` = "Amazon clone".
  (We have no real attributes — this is the honest subset.)
- `About this item` — `<ul>` disc bullets; if a bullet contains `:` bold the
  part before it (mimics the 【…】 lead-in). Already have bullets.
- Cut (call out in walkthrough): variant/size swatches, "bought together"
  bundle, review content, Q&A.

## Buy box (right, bordered card `#d5d9d9`, rounded 8px, ~16px pad)
- Price (superscript style).
- `FREE delivery` line + `Deliver to United States` with pin (static).
- `In Stock` green `#007600` / `Currently unavailable` red.
- `Quantity: [1 ▾]` select.
- `Add to cart` — yellow `#ffd814` pill.
- `Buy Now` — orange `#ffa41c` pill.
- key/value: `Ships from` Amazon clone · `Sold by` Amazon clone · `Returns`
  Eligible for demo · `Payment` Secure (mock).
- `Add to List` — outlined pill (decorative or → cart).

## Below the fold
- Keep the `More in {Department}` related grid, retitled
  `Products related to this item`, card style matching the search card.

---

# Priority / sequencing (all three pages)

1. **Header + footer** rebuild (touches every page) — spec §1, §4.
2. **Home** — spec §2, §3.
3. **Search page** — rail facets + card with add-to-cart + sort select.
4. **PDP** — spec table, badges, breadcrumb, gallery border polish.
Shared: `PriceTag`, `ProductCard` (one card used by home scrollers, search
grid, related grid), `Stars`, dark `Badge`, facet `<FilterRail>`.
