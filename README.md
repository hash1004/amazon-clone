**Live:** https://stillcoffeeandco.svdistributor.com

# Still Coffee and Co.

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

- **New brand.** "Still Coffee and Co." — no more Amazon wordmark, Prime badge,
  "Amazon's Choice," or copyright line. One roast-toned caramel accent
  replaces Amazon's own button orange.
- **New catalog.** ~194 dummyjson products across five departments →
  12 curated coffees (origin, process, roast level, tasting notes), each
  photographed with real, license-clean Unsplash photography instead of
  the old generic e-commerce catalog shots.
- **New structure, not just new colors.** The department mega-menu, the
  "Categories" mobile tab, and the per-department home/search facets are
  gone — there's only one category. Home is one full-screen **Spotlight**
  (a slow carousel of featured coffees, one brown block per slide) plus
  roast-level sections (Light / Medium / Dark). Search filters by roast level and origin
  instead of department and brand. The product page adds coffee-specific
  sections — tasting notes, a brew guide by roast level — in place of the
  generic spec table.
- **Reskinned, not rebuilt:** cart, checkout, account, auth, and the 404
  page keep their exact working logic (real cart state, real address CRUD,
  real order creation, real auth) — only copy, badges, and the wordmark
  changed to match the new brand.

## What's implemented

- **Home** — a **Spotlight** hero that fills the first screen on phones and
  laptops: featured coffees (image, origin, tasting notes) that advance on
  their own, pause on hover/touch, and swipe on phones. Then a 4-up grid per
  roast level and a recently-viewed strip.
- **Search** — relevance search (`src/lib/product-search.ts`): every word
  must match somewhere (title, origin, tasting notes, roast, process,
  description) in any order, tolerates typos and missing accents, maps taste
  words like "fruity" or "nutty" to notes. Roast level + origin + price +
  rating filters in one "Filters & Sort" panel, removable filter chips,
  pagination, and **type-ahead suggestions** (coffees, origins, roast levels)
  from the same search.
- **Product page** — image gallery with in-frame hover zoom (mouse only;
  swipe on touch), price / savings, stock ("Only N left") + delivery date, quantity, Add to Cart / Buy Now / Save beans, tasting
  notes, a roast-level brew guide (ratios + time by method), spec table,
  related coffees at the same roast level.
- **Cart** — guest cart in `localStorage`; quantities, remove, subtotal. Checks
  live stock (`/api/stock`): flags low or sold-out lines, caps quantities at
  what's left, and holds checkout until every line can be filled.
- **Checkout** — 3-step accordion: saved-address picker + inline add, delivery
  option (standard / express with date ranges), payment (card / UPI / cash on
  delivery) with client-side formatting + validation and a mock decline + retry
  path. Live order summary with discount, delivery and tax. Every address and
  payment field only accepts what belongs in it (letters-only names, digits-only
  ZIP/PIN, etc.), filtered as you type and enforced again on the server
  (`src/lib/field-rules.ts`). Placing an order takes stock in the same
  transaction, so the last bag can't be sold twice.
- **Orders** — list with short order numbers, status badge, progress bar and a
  compact item strip (a few thumbnails + "+N") that stays tidy for big orders;
  order detail with a delivery-tracking timeline (advances by elapsed time),
  full breakdown, and "Buy it again".
- **Account** — saved addresses CRUD, order history.
- **Saved Beans** (the wishlist; login required) — stored on the account so it
  follows you across devices; recently-viewed stays local to the browser.
- Auth (email + password), sign-in page, empty-mug 404, toasts, error
  boundaries, image fallbacks, mobile menu, sticky header.

**Deliberately cut:** review authoring, seller accounts, recommendation ML,
subscriptions, real returns/refunds, real payment processing, OAuth,
cross-device cart sync.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack), containerized and
  deployed on a self-hosted Docker Swarm host
- **Tailwind CSS v4** — CSS-first design tokens (`src/app/globals.css`);
  one accent color (roast caramel), sharp corners throughout (buttons
  included), Archivo body + Fraunces display type.
- **Prisma 7 + PostgreSQL**, driver adapter (`@prisma/adapter-pg`)
- **Auth.js** (credentials, JWT sessions)

## Local development

```bash
npm install
cp .env.example .env          # set DATABASE_URL and AUTH_SECRET
npx prisma db push            # sync schema
npx prisma db seed            # 12 curated coffees + sample reviews, real Unsplash photography
npm run dev
```

Checkout is card-only (US). Payments are mocked, so checkout runs in **test
mode** unless `CHECKOUT_TEST_MODE="false"`: the payment step shows a "Test
mode" banner and a **Fill test card** button (`4242 4242 4242 4242`), and any
number ending `0002` is declined. With test mode off, the hints are hidden
and the orders API refuses test card numbers. It's read at request time, so
set it on the running service, not at build.

## Deploying

Production is a two-service Docker Swarm stack (`amazon-clone_web` +
`amazon-clone_db`) on a self-hosted Contabo VPS, behind Traefik
(`/root/compose/amazon-clone.yml` on that host — not in this repo, since
it holds the DB password).

### Automatic: every merge to `main`

`.github/workflows/deploy.yml` runs lint, typecheck and a production build
on every pull request and every push to `main`. On `main`, if those pass,
it SSHes into the VPS, runs `scripts/deploy.sh` (fetch `origin/main`, then
`release.sh`), runs the insert-only review seed, and checks the site
answers. Deploys queue rather than overlap.

One-time setup:

1. On the VPS, create a deploy-only key pair and authorize it:
   `ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""` then
   `cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys`.
2. Make sure the VPS checkout can fetch this repo: `git -C /root/amazon-clone
   fetch origin` should work (add a read-only GitHub deploy key if the repo
   is private).
3. In GitHub → Settings → Environments, create `production` (optionally
   with required reviewers, to approve each deploy).
4. In GitHub → Settings → Secrets and variables → Actions, add
   `DEPLOY_HOST`, `DEPLOY_USER` (`root`), `DEPLOY_SSH_KEY` (the private
   key from step 1) and `DEPLOY_KNOWN_HOSTS` (output of
   `ssh-keyscan <host>`, run from a machine you trust).

Until the secrets exist, the check job still runs and the deploy job
fails at the SSH step without touching anything. The manual routes below
keep working either way.

### Manual: push to the VPS

#### One-time setup (already done on the current VPS)

```bash
ssh contabo
cd /root/amazon-clone
git config receive.denyCurrentBranch updateInstead   # push updates the working tree directly
cp scripts/hooks/post-receive .git/hooks/post-receive
chmod +x .git/hooks/post-receive
```

Then, from wherever you push from (laptop, not this repo's sandbox), add
a `production` remote. Use your SSH config alias for the VPS (e.g.
`contabo:/root/amazon-clone`, matching a `Host contabo` entry in
`~/.ssh/config`) rather than the raw `root@<ip>` form — git's SSH
invocation only picks up the right `IdentityFile` through the alias:

```bash
git remote add production contabo:/root/amazon-clone
```

#### Push to deploy

```bash
git push production main
```

That's it — the push updates the working tree, the `post-receive` hook
runs `scripts/release.sh` (build, sync schema, roll the service), and
the output streams back to your terminal since git forwards hook
stdout/stderr over the push connection. It only fires on `main`; pushing
any other branch just updates the ref.

`release.sh`/`deploy.sh` are safe to re-run for routine code changes —
neither touches the catalog. Schema sync (`prisma db push`, no
`--accept-data-loss`) fails loudly instead of dropping data if a change
would be destructive; if that happens, resolve it by hand rather than
forcing it.

Prefer pulling from GitHub `main` instead of pushing directly? Run
`./scripts/deploy.sh` on the VPS — it fetches `origin/main` and calls
the same `release.sh`.

A few coffees are deliberately kept low on stock (3–8 bags) so the "Only N
left" states show; orders decrement stock and refuse to oversell. To apply
those levels to the live catalog without reseeding — or reset them after
test orders — run `./scripts/set-low-stock.sh` on the VPS.

Sample written reviews go onto the live catalog with
`./scripts/seed-reviews-prod.sh` (run on the VPS after a deploy has added
the `Review` table). It only inserts, skips any coffee that already has
reviews, and reads the database URL from the running service — safe to
re-run. Locally: `npm run db:seed-reviews`.

Reseeding the catalog is a separate, deliberately manual step
(`prisma/seed.ts` deletes every `Product`/`Cart`/`Order` row first) —
run `./scripts/seed-prod.sh` only when you actually mean to replace the
whole catalog, never as part of a routine deploy.

## Domain

The shop is served at `stillcoffeeandco.svdistributor.com`, a subdomain of
the existing `svdistributor.com`: an A record pointing at the same VPS,
routed by Traefik to this deployment (see the `amazon-clone.yml` compose
file on the host, not in this repo — it holds the DB password). Site
metadata and Open Graph links default to this domain; set
`NEXT_PUBLIC_SITE_URL` to override. The original `amazon.svdistributor.com`
hostname was the pre-rebrand address; keep or drop its Traefik route as
you prefer.

## Agent logs

Every prompt/response pair from the build sessions is captured under
`.agent-logs/` (see `CAPTURE-TEST.md` for the mechanism), committed
incrementally alongside the code each session produced.
