# Product Design TODO — Still Coffee and Co.

A product-design review of the storefront as it stands. Each item names where
the issue lives so it can be picked up directly. Priority: **P0** hurts trust,
accessibility or conversion today. **P1** is a clear UX gap. **P2** is polish.

---

## 1. Design system & accessibility

- [ ] **P0 — `--text-muted` fails contrast.** `#948a78` on `--bg-surface`
      `#fffdfa` is about 3.3:1, which fails WCAG AA for the `text-xs` it is used
      at (card roast/origin line, "Try" label on empty search). Darken it to
      ≥4.5:1 (around `#776c5b`) or keep it for large text only.
      (`src/app/globals.css`)
- [ ] **P0 — Status colors are the same color as the brand.** `--status-success`,
      `--text-deal` and `--text-accent` are all `#7a4419`, so "Sold out",
      "Only 3 left", "20% off", links and "done" checkmarks look identical.
      Give scarcity/unavailable states their own token and keep success
      separate from links.
- [ ] **P1 — Radius rules are inconsistent.** Tokens set every radius to 0, but
      the PDP discount badge uses `rounded-full` while the card version of the
      same badge is square, and the checkout "Default" tag uses bare `rounded`
      (Tailwind's 4px, which isn't a token). Pick one rule per component and
      audit the uses of `rounded-full` and `rounded`.
- [ ] **P1 — Retire the leftover `rounded-pill` name.** The token is 0px now, so
      the class name misleads designers and engineers. Rename it to
      `rounded-control`, or remove it.
- [ ] **P1 — Filter chips need accessible labels.** The ✕ is `aria-hidden`, so
      a screen reader hears "Ethiopia" as a plain link. Add
      `aria-label="Remove filter: Ethiopia"`. (`src/app/(shop)/s/page.tsx`)
- [ ] **P1 — Breadcrumb semantics.** Add `aria-label="Breadcrumb"` to the PDP
      `<nav>` and show the current product as the last item with
      `aria-current="page"`.
- [ ] **P1 — Payment method toggles.** They are plain buttons with no selected
      state for assistive tech. Use a radio group, matching the address and
      delivery steps. (`checkout-flow.tsx`)
- [ ] **P2 — Dark mode.** There are no dark tokens. The brown chrome already
      suits dark mode, so define a `prefers-color-scheme: dark` set for canvas,
      surface and text.
- [ ] **P2 — Motion audit.** `Reveal` fades in whole search result grids and
      PDP sections. Results should show up immediately. Keep reveals for
      editorial home sections only. Also check `hover:scale` on the Add to
      Cart button and the logo shimmer against the reduced-motion setting.

## 2. Home

- [ ] **P0 — Copy doesn't match the catalog.** "One coffee, done well" sits
      above three shelves of different coffees. Rewrite it around freshness or
      sourcing, e.g. "Small-batch roasted, shipped within 48 hours".
- [ ] **P1 — Help people choose a roast.** Add a short "Not sure where to start?"
      module (a three-question quiz, or a flavor → roast guide) above the roast
      shelves.
- [ ] **P1 — Value-prop strip.** Show roast date, free-shipping threshold and
      freshness guarantee near the top. Right now only the PDP mentions
      delivery.
- [ ] **P2 — Recently viewed is at the very bottom.** For returning visitors,
      try moving it above the roast shelves.

## 3. Product card & listing (`product-card.tsx`, `/s`)

- [ ] **P0 — Search filters and sorts by rating, but cards don't show ratings.**
      Search offers "4★ & up" and "Sort by rating", but cards deliberately hide
      ratings. Either show a small rating on cards or remove the rating filter
      and sort.
- [ ] **P1 — The wishlist heart only appears on hover from `sm` up.** Tablets
      (touch, ≥640px) never see it. Gate it on `(hover: hover)` instead of a
      width breakpoint.
- [ ] **P1 — Duplicated headings.** The filter bar says "1–24 of N results for
      'x'" and the H1 below says "Results for 'x'". Keep one.
- [ ] **P1 — Pagination.** "‹ Previous 2 / 5 Next ›" gives no way to jump pages.
      Add numbered pages or "Load more".
- [ ] **P2 — Add tasting notes to cards.** Show 2–3 note chips. They sell
      specialty coffee better than the origin line alone.
- [ ] **P2 — The price chip hardcodes `$`.** Build the label with `formatPrice`.

## 4. Product detail page (`src/app/(shop)/p/[slug]/page.tsx`)

- [ ] **P0 — Missing coffee purchase options.** There's no grind selector
      (whole bean / espresso / filter / French press), no bag size, and no
      subscribe-and-save option. These are the core decisions when buying
      coffee.
- [ ] **P0 — "(1,234 reviews)" with no reviews to read.** Add a reviews section,
      or link the count to one. Move the rating up near the title, where
      shoppers look for it.
- [ ] **P1 — Show roast date and freshness.** It's the brand's main promise but
      it isn't on the page. Add "Roasted to order · ships within 48h" by the
      price.
- [ ] **P1 — Quantity stepper.** Drop the `01` zero-padding. Style the "−"
      button as disabled at 1, the same way "+" is disabled at the limit.
- [ ] **P1 — Use a flavor profile, not a spec table.** SKU and net weight are
      warehouse data. A visual scale for acidity, body and sweetness would
      tell shoppers more.
- [ ] **P2 — Brew guide.** Link each method to a full recipe, and consider a
      grind-size hint per method.

## 5. Cart & checkout (`checkout-flow.tsx`)

- [ ] **P0 — Currency and payment methods don't match.** Prices are in USD, but
      checkout offers UPI and Cash on Delivery (India-specific). Pick the
      market and match the payment methods, address format and tax wording to
      it.
- [ ] **P0 — Demo copy is visible to shoppers.** "Cards are not charged. Use
      4242…" and the `fail@` UPI hint show in the real flow. Show them only in
      demo/test mode.
- [ ] **P1 — Item counts disagree.** The H1 counts units, e.g. "(3 items)",
      while the summary says "Items (2)" because it counts lines. Use one
      definition in both places.
- [ ] **P1 — Two "Place your order" buttons.** The sidebar button stays
      disabled until step 3 with no explanation. Hide it until step 3, or
      label it with the next step ("Continue to payment").
- [ ] **P1 — Step 3 never shows as done**, and the step headers don't say how
      many steps there are. Add a compact progress indicator.
- [ ] **P1 — Legal line borrows Amazon's wording** ("Conditions of Use and
      Privacy Notice"). Rewrite it in the brand's voice and link to real
      pages.
- [ ] **P2 — Free-shipping progress.** Add "Add $X more for free delivery" in
      the cart and the order summary.

## 6. Content & brand

- [ ] **P0 — The info pages are placeholders.** About, Careers, Blog, Shipping,
      Help, Terms and Privacy show one line each (e.g. "On the real site,
      this covers…"). Write real content, or remove them from the footer.
      (`src/app/(shop)/info/[slug]/page.tsx`)
- [ ] **P1 — Voice and tone guide.** Toasts use Amazon-style Title Case ("Added
      1 to Cart"), which doesn't match the editorial serif voice elsewhere.
      Write a one-page microcopy guide (sentence case, how to name
      bags/coffees, error tone).
- [ ] **P2 — Photography direction.** Define shot types (bag front, beans
      macro, brew in use) so every product has a consistent gallery.

## 7. Research & validation

- [ ] Run 5 moderated usability sessions on the path home → pick a roast →
      PDP → checkout. Focus on roast choice and grind confusion.
- [ ] Instrument the funnel (PDP view → add to cart → checkout step 1/2/3 →
      order) to find where people drop off.
- [ ] Test on mobile: MobileBuyBar overlap, the collapsed ShopMenu (is the cart
      count visible?), and the checkout keyboard for card fields.
- [ ] Accessibility pass with axe and a screen reader (VoiceOver/NVDA) on home,
      PDP and checkout.

---

### Suggested order

1. P0 accessibility tokens (contrast, status colors): small change, sitewide
   effect.
2. P0 trust issues: placeholder pages, demo copy, currency/payment mismatch.
3. PDP purchase options (grind / size / subscribe): biggest conversion lever,
   needs product and engineering scoping.
4. Everything else in P1, grouped by page.
