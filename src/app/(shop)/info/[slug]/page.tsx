import Link from "next/link";
import type { Metadata } from "next";

const PAGES: Record<string, { title: string; blurb: string }> = {
  about: {
    title: "About",
    blurb: "On the real site, this covers the company, leadership and mission.",
  },
  careers: {
    title: "Careers",
    blurb: "Job listings and hiring information across the company.",
  },
  blog: {
    title: "Blog",
    blurb: "Company news, announcements and stories.",
  },
  "investor-relations": {
    title: "Investor Relations",
    blurb: "Financial reports, filings and shareholder information.",
  },
  sell: {
    title: "Sell products",
    blurb: "Where third-party sellers register and manage a storefront.",
  },
  affiliate: {
    title: "Become an Affiliate",
    blurb: "Earn referral commissions by linking to products.",
  },
  advertise: {
    title: "Advertise Your Products",
    blurb: "Sponsored placements and advertising tools for sellers.",
  },
  "self-publish": {
    title: "Self-Publish with Us",
    blurb: "Publish and distribute books directly to the store.",
  },
  "business-card": {
    title: "Business Card",
    blurb: "A store-branded rewards credit card.",
  },
  "shop-with-points": {
    title: "Shop with Points",
    blurb: "Redeem credit-card reward points at checkout.",
  },
  "reload-balance": {
    title: "Reload Your Balance",
    blurb: "Add money to a gift-card balance to pay with later.",
  },
  "currency-converter": {
    title: "Currency Converter",
    blurb: "See prices and pay in your local currency.",
  },
  "shipping-policy": {
    title: "Shipping Rates & Policies",
    blurb: "Delivery speeds, costs and regional availability.",
  },
  help: {
    title: "Help",
    blurb: "Customer service, returns, and answers to common questions.",
  },
  "conditions-of-use": {
    title: "Conditions of Use",
    blurb: "The terms that govern use of the site.",
  },
  "privacy-notice": {
    title: "Privacy Notice",
    blurb: "How personal information is collected and used.",
  },
  "consumer-health-data": {
    title: "Consumer Health Data Privacy Disclosure",
    blurb: "How health-related data is handled.",
  },
  "ad-choices": {
    title: "Your Ads Privacy Choices",
    blurb: "Controls for interest-based advertising.",
  },
};

function resolve(slug: string) {
  return (
    PAGES[slug] ?? {
      title: slug
        .split("-")
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join(" "),
      blurb: "",
    }
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: resolve(slug).title };
}

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = resolve(slug);

  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <nav className="mb-3 text-xs text-text-secondary">
        <Link href="/" className="link">
          Home
        </Link>{" "}
        › <span>{page.title}</span>
      </nav>

      <h1 className="text-2xl font-bold">{page.title}</h1>

      <div className="mt-4 rounded-lg border border-border-default bg-surface p-6">
        <p className="text-sm font-medium">
          This page isn&apos;t built out in this demo.
        </p>
        {page.blurb && (
          <p className="mt-2 text-sm text-text-secondary">{page.blurb}</p>
        )}
        <p className="mt-4 text-sm text-text-secondary">
          The demo focuses on the shopping flow — browse, search, product pages,
          cart, checkout, orders and your list.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/s"
            className="rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="rounded-pill border border-border-strong px-6 py-2 text-sm hover:bg-subtle"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
