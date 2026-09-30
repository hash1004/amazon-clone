import { DELIVERY_OPTIONS } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";

/**
 * Copy for the /info pages. Anything factual here (delivery speeds and
 * fees, what's stored about you, how payment works) is taken from how the
 * site actually behaves — keep it in step with the code it describes.
 * Policy wording (returns, terms) is a plain-language draft for the
 * business to confirm, not legal advice.
 */
export type InfoPage = {
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

const standard = DELIVERY_OPTIONS.find((o) => o.id === "standard")!;
const express = DELIVERY_OPTIONS.find((o) => o.id === "express")!;

export const INFO_PAGES: Record<string, InfoPage> = {
  about: {
    title: "Our story",
    intro:
      "Still Coffee and Co. is a small-batch roaster. We keep a short list of coffees, roast each one to order, and ship it while it's still fresh.",
    sections: [
      {
        heading: "Why a short list",
        body: [
          "Twelve coffees, three roast levels. A short list means every coffee gets roasted often, so none of it sits on a shelf going stale, and each one earns its place by tasting distinct from the rest.",
        ],
      },
      {
        heading: "Roasted to order",
        body: [
          "We roast in small batches and ship within 48 hours of roasting. Your bag is days old when it arrives, not months.",
        ],
      },
    ],
  },
  blog: {
    title: "How we roast",
    intro: "What the roast levels on our coffees mean, and how to pick one.",
    sections: [
      {
        heading: "Light roasts",
        body: [
          "Taken off the heat early to keep what the farm and the process put into the bean: floral, fruity, bright acidity, lighter body. Best as pour-over, drip or AeroPress.",
        ],
      },
      {
        heading: "Medium roasts",
        body: [
          "Balanced. Some of the brightness gives way to caramel, chocolate and nut sweetness. Works in almost any brewer, with or without milk.",
        ],
      },
      {
        heading: "Dark roasts",
        body: [
          "Roasted longer for a heavy body, low acidity and bittersweet, cocoa and smoky notes. Built for espresso, moka pot and French press, and it stands up to milk.",
        ],
      },
      {
        heading: "Whole bean or ground?",
        body: [
          "Whole bean stays fresh longest, so grind it just before you brew if you can. If you don't have a grinder, choose the grind that matches your brewer on the product page and we'll grind it after roasting.",
        ],
      },
    ],
  },
  "shipping-policy": {
    title: "Shipping & returns",
    intro: "We ship within the United States only.",
    sections: [
      {
        heading: "Delivery options",
        body: [
          `${standard.label}: free, arrives in ${standard.minDays}–${standard.maxDays} business days.`,
          `${express.label}: ${formatPrice(express.feeCents)}, arrives in ${express.minDays}–${express.maxDays} business days.`,
          "Every order is roasted to order and ships within 48 hours of roasting. You'll see the estimated delivery dates at checkout and on your order page.",
        ],
      },
      {
        heading: "Tracking",
        body: ["Follow each order from Your orders. Every order page shows where it is and when it should arrive."],
      },
      {
        heading: "Returns",
        body: [
          "Coffee is food, so we can't take opened bags back. If your order arrives damaged, the wrong coffee or the wrong grind, contact us within 14 days of delivery and we'll replace it or refund you.",
        ],
      },
    ],
  },
  help: {
    title: "Help",
    intro: "Answers to the questions we get most.",
    sections: [
      {
        heading: "Which grind should I choose?",
        body: [
          "Whole bean if you have a grinder. Otherwise match your brewer: Espresso (fine) for espresso machines and moka pots, Drip & pour-over (medium) for drip machines, V60, Chemex and AeroPress, French press (coarse) for French press and cold brew. Each product page has a brew guide too.",
        ],
      },
      {
        heading: "Can I change the grind after adding to cart?",
        body: ["Yes. Each line in your cart has a grind selector. The bag size is set when you add it."],
      },
      {
        heading: "When will my order arrive?",
        body: [
          "Standard delivery is free and takes 4–6 business days; express takes 1–2. Your order page shows the estimate and progress.",
        ],
      },
      {
        heading: "How do I reorder?",
        body: ['Open Your orders and choose "Buy it again". It adds the same coffees, grinds and sizes to your cart at today\'s prices.'],
      },
      {
        heading: "Can I write a review?",
        body: [
          "Yes. Sign in and use the form in the Reviews section of any coffee. If you've ordered that coffee, your review is marked as a verified purchase.",
        ],
      },
    ],
  },
  "conditions-of-use": {
    title: "Terms of Use",
    intro: "The terms for using this site and ordering from us.",
    sections: [
      {
        heading: "Orders",
        body: [
          "Placing an order is an offer to buy. We confirm it once payment is accepted and stock is reserved. If a coffee sells out before we can confirm, we'll tell you at checkout and won't charge you for it.",
          "Prices are in US dollars and include the bag size shown. Sales tax is estimated at checkout.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "Keep your password to yourself; you're responsible for orders placed from your account. Reviews you post must be your own honest experience.",
        ],
      },
      {
        heading: "Changes",
        body: ["We may update these terms. The version on this page is the one that applies."],
      },
    ],
  },
  "privacy-notice": {
    title: "Privacy Policy",
    intro: "What we keep about you, and why.",
    sections: [
      {
        heading: "What we store",
        body: [
          "Your account: name, email address and a hashed password (never the password itself).",
          "Delivery addresses you save, your orders, the coffees you save to Saved Beans, and reviews you post (shown with your first name and last initial).",
          "For card payments we keep only the last four digits of the card, to show on your order. We don't store full card numbers or security codes.",
        ],
      },
      {
        heading: "What stays in your browser",
        body: [
          "Your cart and your recently viewed coffees are stored in your browser, not on our servers. Clearing your browser data clears them. We use a sign-in cookie to keep you logged in.",
        ],
      },
      {
        heading: "What we use it for",
        body: [
          "To deliver your orders, show your order history, and run your account. We don't sell your information.",
        ],
      },
    ],
  },
};
