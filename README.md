# amazon-clone

A working slice of [amazon.com](https://amazon.com), built as a timed
assignment. The goal was to reproduce the shopping experience closely — chrome,
home, search, product, cart, checkout, orders — not just a generic storefront.

**Live:** https://amazon-clone-sgtc.vercel.app

## What's implemented

- **Home** — hero carousel, category tiles, and product rails that are each a
  distinct, non-overlapping cut of the catalog: Today's Deals (biggest
  discount), Best Sellers (most reviews), New Arrivals, Top Rated, and
  per-department rows. Recently-viewed strip.
- **Search** — full-text over title/brand, department + brand + price + rating
  filters, sort, removable filter chips, pagination, **type-ahead autocomplete**
  (products, brands, departments), and a mobile filter/sort sheet.
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
- **Tailwind CSS v4** — design tokens ported from an internal POS design
  system, reskinned to Amazon's palette
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
