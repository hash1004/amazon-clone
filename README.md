# amazon-clone

A working slice of [amazon.com](https://amazon.com), built as a timed
assignment: chrome, home, search, product, cart, checkout, orders.

**Live:** https://amazon-clone-sgtc.vercel.app

## Design direction (v2 — resubmission)

The first submission matched amazon.com's own layout closely and was
rejected for it: a faithful clone isn't a point of view. **The opinion this
version leads with: amazon.com is too crowded.** Banner carousels,
poster-tile grids, and a loud badge on every third card compete for
attention instead of earning it. The redesign replaces that with a calm,
considered layout that still surfaces categorization and deals — quietly
(borders, one accent color, discounts priced inline) instead of loudly
(carousels, ribbons, three competing CTA colors).

**What was built first:** the Home page and its token system, because
that's where the opinion had to prove itself visually before anything
else could inherit it. **What changed and where:**

- **Home** and **Search** got the deep restructure — see below.
- Everything else (product page, cart, checkout, orders, account,
  wishlist, auth, header/footer chrome) kept its exact structure and every
  feature — only the visual skin (tokens, badges, the wordmark) changed.
  Nothing was cut from these flows; the opinion is about Home's layout,
  not about removing functionality.

Full rationale, the token table, and the exact module decisions are in
[`design/redesign-v2-spec.md`](design/redesign-v2-spec.md).

## What's implemented

- **Home** — one **Spotlight**: a single considered pick (image, price,
  discount, rating) instead of an auto-rotating carousel, plus a static
  4-up product grid per department instead of nine horizontally-scrolling
  themed rails (Deals / Best Sellers / New Arrivals / Top Rated / 5×
  "More to explore"). Same catalog, reorganized — discounts now show
  inline on the card instead of in a separate red-ribboned rail, and
  bestseller rank chips are cut in favor of the rating itself. Recently-
  viewed strip.
- **Search** — full-text over title/brand, department + brand + price + rating
  filters, sort, removable filter chips, pagination, **type-ahead autocomplete**
  (products, brands, departments), and a mobile filter/sort sheet. Its
  clutter wasn't structural, so its pass was restraint: quiet discount
  pills instead of a bold ribbon, tightened copy.
- **Product page** — image gallery with hover-zoom, MRP / price / savings,
  stock + delivery date, quantity, Add to Cart / Buy Now / Add to List, spec
  table, seller card, frequently-bought-together, related items.
- **Cart** — guest cart in `localStorage`; quantities, remove, subtotal.
- **Checkout** — 3-step accordion: saved-address picker + inline add, delivery
  option (standard / express with date ranges), payment (card / UPI / cash on
  delivery) with client-side formatting + validation and a mock decline + retry
  path. Live order summary with discount, delivery and tax.
- **Orders** — order detail with a delivery-tracking timeline (advances by
  elapsed time), full breakdown, and "Buy it again".
- **Account** — saved addresses CRUD, order history.
- **Wishlist** (login required) + recently-viewed (local).
- Auth (email + password), Amazon-style sign-in page, dogs-of-Amazon 404,
  toasts, error boundaries, image fallbacks, mobile menu, auto-hiding header.

**Deliberately cut:** review authoring, seller accounts, recommendation ML,
Prime membership, real returns/refunds, real payment processing, OAuth,
cross-device cart sync.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) on **Vercel**
- **Tailwind CSS v4** — CSS-first design tokens (`src/app/globals.css`);
  one accent color, Work Sans + Newsreader. See the design doc above.
- **Prisma 7 + PostgreSQL** (Neon), driver adapter (`@prisma/adapter-pg`)
- **Auth.js** (credentials, JWT sessions)

## Local development

```bash
npm install
cp .env.example .env          # set DATABASE_URL and AUTH_SECRET
npx prisma db push            # sync schema
npx prisma db seed            # ~194 products from dummyjson.com
npm run dev
```

Checkout test cards: `4242 4242 4242 4242` succeeds, any number ending `0002`
is declined. UPI IDs starting `fail@` simulate a failed request.

## Agent logs

Every prompt/response pair from the build sessions is captured under
`.agent-logs/` (see `CAPTURE-TEST.md` for the mechanism), committed
incrementally alongside the code each session produced.
