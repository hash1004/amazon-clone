**Live:** https://amazon.svdistributor.com _(domain predates the rebrand below — see [Still open](#still-open))_

# Still Coffee Co.

A single-category coffee shop: one small-batch roaster, a dozen coffees,
built as a timed assignment — chrome, home, search, product, cart,
checkout, orders, all backed by a real database.

## Design direction (v3 — rebuild)

The first two submissions kept amazon.com's shape — a general marketplace
with departments, "Prime," "Amazon's Choice," Amazon's own wordmark and
copyright line — even after a visual reskin. The brief changed: an interface
designed from scratch, not a clone with new colors. **v3 is a different
product, not a different skin:** a single-category specialty-coffee store,
with its own name, palette, catalog, and layout, on the same real backend
(Next.js + Prisma + PostgreSQL) as before.

What actually changed:

- **New brand.** "Still Coffee Co." — no more Amazon wordmark, Prime badge,
  "Amazon's Choice," or copyright line. One roast-toned caramel accent
  replaces Amazon's own button orange.
- **New catalog.** ~194 dummyjson products across five departments →
  12 curated coffees (origin, process, roast level, tasting notes), each
  photographed with real, license-clean Unsplash photography instead of
  the old generic e-commerce catalog shots.
- **New structure, not just new colors.** The department mega-menu, the
  "Categories" mobile tab, and the per-department home/search facets are
  gone — there's only one category. Home is one **Spotlight** (a single
  featured coffee, not a rotating carousel) plus roast-level sections
  (Light / Medium / Dark). Search filters by roast level and origin
  instead of department and brand. The product page adds coffee-specific
  sections — tasting notes, a brew guide by roast level — in place of the
  generic spec table.
- **Reskinned, not rebuilt:** cart, checkout, account, auth, and the 404
  page keep their exact working logic (real cart state, real address CRUD,
  real order creation, real auth) — only copy, badges, and the wordmark
  changed to match the new brand.

## What's implemented

- **Home** — one **Spotlight**: this week's featured coffee (image, tasting
  notes, price) instead of an auto-rotating carousel, plus a static 4-up
  grid per roast level. Recently-viewed strip.
- **Search** — full-text over title/description/origin, roast level +
  origin + price + rating filters, sort, removable filter chips,
  pagination, **type-ahead autocomplete** (coffees, origins, roast levels),
  and a mobile filter/sort sheet.
- **Product page** — image gallery with hover-zoom, price / savings, stock +
  delivery date, quantity, Add to Cart / Buy Now / Add to List, tasting
  notes, a roast-level brew guide (ratios + time by method), spec table,
  related coffees at the same roast level.
- **Cart** — guest cart in `localStorage`; quantities, remove, subtotal.
- **Checkout** — 3-step accordion: saved-address picker + inline add, delivery
  option (standard / express with date ranges), payment (card / UPI / cash on
  delivery) with client-side formatting + validation and a mock decline + retry
  path. Live order summary with discount, delivery and tax.
- **Orders** — order detail with a delivery-tracking timeline (advances by
  elapsed time), full breakdown, and "Buy it again".
- **Account** — saved addresses CRUD, order history.
- **Wishlist** (login required) + recently-viewed (local).
- Auth (email + password), sign-in page, empty-mug 404, toasts, error
  boundaries, image fallbacks, mobile menu, auto-hiding header.

**Deliberately cut:** review authoring, seller accounts, recommendation ML,
subscriptions, real returns/refunds, real payment processing, OAuth,
cross-device cart sync.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack), containerized and
  deployed on a self-hosted Docker Swarm host
- **Tailwind CSS v4** — CSS-first design tokens (`src/app/globals.css`);
  one accent color (roast caramel), Work Sans + Newsreader.
- **Prisma 7 + PostgreSQL**, driver adapter (`@prisma/adapter-pg`)
- **Auth.js** (credentials, JWT sessions)

## Local development

```bash
npm install
cp .env.example .env          # set DATABASE_URL and AUTH_SECRET
npx prisma db push            # sync schema
npx prisma db seed            # 12 curated coffees, real Unsplash photography
npm run dev
```

Checkout test cards: `4242 4242 4242 4242` succeeds, any number ending `0002`
is declined. UPI IDs starting `fail@` simulate a failed request.

## Deploying

Production is a two-service Docker Swarm stack (`amazon-clone_web` +
`amazon-clone_db`) on a self-hosted Contabo VPS, behind Traefik
(`/root/compose/amazon-clone.yml` on that host — not in this repo, since
it holds the DB password). There's no CI/CD; deploys are manual, run by
hand on the VPS:

```bash
ssh contabo
cd /root/amazon-clone
./scripts/deploy.sh          # pull main, rebuild, sync schema, roll the service
```

`deploy.sh` is safe to re-run for routine code changes — it does **not**
touch the catalog. Schema sync (`prisma db push`, no `--accept-data-loss`)
fails loudly instead of dropping data if a change would be destructive;
if that happens, resolve it by hand rather than forcing it.

Reseeding the catalog is a separate, deliberately manual step
(`prisma/seed.ts` deletes every `Product`/`Cart`/`Order` row first) —
run `./scripts/seed-prod.sh` only when you actually mean to replace the
whole catalog, never as part of a routine deploy.

## Still open

The production domain (`amazon.svdistributor.com`) predates this rebrand
and is infrastructure this codebase doesn't control (DNS/hosting on the
Contabo VPS) — it still works, it just no longer matches the name on the
page. Pointing a new subdomain at the same deployment is a one-time
infra change outside this repo.

## Agent logs

Every prompt/response pair from the build sessions is captured under
`.agent-logs/` (see `CAPTURE-TEST.md` for the mechanism), committed
incrementally alongside the code each session produced.
