# Photography direction — Still Coffee and Co.

A brief for product photography, written from how the storefront actually
uses images. The goal: every coffee has its own consistent set of photos,
so the grid reads as one shop and a shopper can tell coffees apart at a
glance.

## Why this is needed now

The catalog uses stock Unsplash photos, and none of them show our bags.
Most are generic coffee scenes (a latte, a hand holding a cup), several
don't say anything about the coffee they're attached to, and one photo is
shared by two coffees (the espresso extraction shot on House Espresso Blend
and French Roast). Product cards show only the first photo, so today that
first photo is doing no work to tell a light Ethiopian from a dark blend.

## Where images appear, and how they're cropped

| Place | Image | Crop | Notes |
| --- | --- | --- | --- |
| Product card (home, search, related, brew pages) | 1st | 1:1, centered, `object-cover` | Shown small (≈280 px). The hero must read at thumbnail size. |
| Product page gallery | All | 4:5 portrait | Hover-zoom on desktop, so shoot sharp enough to crop 2×. |
| Home spotlight | 1st | 1:1 on desktop; free crop on phones | Sits on the dark brown block. |
| Cart, checkout, orders, recently viewed | 1st | 1:1, 40–96 px | Tiny. Needs a clear silhouette. |

**Shoot every frame 4:5, and keep the subject inside the centered 1:1
square.** That one rule makes every crop above work.

## Shot list per coffee (4 frames)

1. **Hero: the bag.** Front of the bag, label readable, centered, on the
   canvas background. This is image 1 on every card, so it has to identify
   the coffee on its own.
2. **Beans.** Macro of that coffee's whole beans, filling the frame. Roast
   color should be honest: light roasts look cinnamon-brown, dark roasts
   look oily and near-black. This is how the grid shows roast level at a
   glance.
3. **In the cup.** Brewed with a method from that coffee's brew guide
   (pour-over for light, espresso or French press for dark), in natural
   light.
4. **Context (optional).** The bag in use: on a counter next to a grinder,
   scooping beans. Hands are fine; faces aren't needed.

## Look and feel

- **Backgrounds.** Warm cream kraft paper or unbleached linen, close to the
  site canvas (`#f8f5ef`), for frames 1–2. For frame 3, dark walnut or the
  brand brown (`#241811`). Never pure white. It glares on the cream canvas
  and punches a hole in dark mode.
- **Light.** One soft window light from the left, gentle shadows. No flash,
  no hard studio shadows.
- **Color.** Neutral-to-warm white balance. Don't push saturation. The
  roast color is product information, so keep it accurate.
- **Props.** Few, and real: a ceramic cup, a V60, a grinder, a scoop. No
  sugar packets, no latte-art close-ups for coffees we'd tell you to drink
  black, no branded third-party gear.
- **Consistency.** Same camera height and angle per frame type across all
  coffees (hero: straight on at bag height; beans: overhead), so the grid
  lines up.

## Files

- **Size.** At least 2400 × 3000 px (4:5) master; upload the master and let
  Next.js resize. Keep files under ~1.5 MB (JPEG quality ~82 or WebP).
- **Color space.** sRGB.
- **No transparency.** Always a real background, so images look right on
  cream and on dark mode.
- **Names.** `<slug>-1-bag.jpg`, `<slug>-2-beans.jpg`, `<slug>-3-cup.jpg`,
  `<slug>-4-context.jpg`, in `images` in that order.
- **Hosting.** Images currently load from `images.unsplash.com` (the only
  host allowed in `next.config.ts`). When our own photos arrive, add their
  host there, or serve them from `public/`.

## Alt text

Each image's alt text should describe what's in it, not repeat the title.
The page already says the title.

- Bag: "12 oz bag of Kenya Nyeri AA, front label"
- Beans: "Light-roasted Kenya Nyeri AA beans, close up"
- Cup: "Kenya Nyeri AA brewed as pour-over in a glass cup"

The product gallery's main image and the cards currently use the product
title as alt text, whichever photo is showing; switching to per-image alt text needs an `imageAlts`
field alongside `images` when these photos land.

## Checklist before a coffee goes live

- [ ] 3–4 frames in the order above, 4:5, subject inside the center square
- [ ] Hero readable at 96 px (check it in the cart)
- [ ] Roast color matches the bag's roast level
- [ ] Looks right on both cream (light mode) and espresso (dark mode) pages
- [ ] Alt text written per image
