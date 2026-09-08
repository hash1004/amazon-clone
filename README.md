# amazon-clone

A working slice of [amazon.com](https://amazon.com), built as a timed assignment.

**Live:** _deploying — link to follow_

## Scope

Browse + search a catalog · product detail · cart (guest cart in
`localStorage`, merges on login) · auth (signup / login) · checkout → **mock
payment** → order confirmation · order history.

**Deliberately cut:** review authoring, seller accounts, recommendations/ML,
Prime, returns, multi-address, real payments.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** — design tokens ported from an internal POS design system
  (`@pos_ui`), reskinned warm/retail
- **Prisma + PostgreSQL** (Neon)
- **Auth.js** for authentication
- Deployed on **Vercel**

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL etc.
npm run dev
```

## Agent logs

Every prompt/response pair from the build sessions is captured under
`.agent-logs/` (see `CAPTURE-TEST.md` for the mechanism). Committed
incrementally alongside the code each session produced.
