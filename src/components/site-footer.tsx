import Link from "next/link";
import { AmazonLogo } from "@/components/ui/amazon-logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Get to Know Us",
    links: [
      { label: "About", href: "/info/about" },
      { label: "Careers", href: "/info/careers" },
      { label: "Blog", href: "/info/blog" },
      { label: "Investor Relations", href: "/info/investor-relations" },
    ],
  },
  {
    heading: "Make Money with Us",
    links: [
      { label: "Sell products", href: "/info/sell" },
      { label: "Become an Affiliate", href: "/info/affiliate" },
      { label: "Advertise Your Products", href: "/info/advertise" },
      { label: "Self-Publish with Us", href: "/info/self-publish" },
    ],
  },
  {
    heading: "Payment Products",
    links: [
      { label: "Business Card", href: "/info/business-card" },
      { label: "Shop with Points", href: "/info/shop-with-points" },
      { label: "Reload Your Balance", href: "/info/reload-balance" },
      { label: "Currency Converter", href: "/info/currency-converter" },
    ],
  },
  {
    heading: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Your Orders", href: "/account/orders" },
      { label: "Your Cart", href: "/cart" },
      { label: "Shipping Rates & Policies", href: "/info/shipping-policy" },
      { label: "Help", href: "/info/help" },
    ],
  },
];

const SUB_BRANDS = [
  ["Amazon Music", "Stream millions of songs"],
  ["Amazon Ads", "Reach customers wherever they spend their time"],
  ["6pm", "Score deals on fashion brands"],
  ["AbeBooks", "Books, art & collectibles"],
  ["ACX", "Audiobook Publishing Made Easy"],
  ["Sell on Amazon", "Start a Selling Account"],
  ["Amazon Business", "Everything For Your Business"],
  ["AmazonGlobal", "Ship Orders Internationally"],
  ["Amazon Web Services", "Scalable Cloud Computing Services"],
  ["Audible", "Listen to Books & Original Audio Performances"],
  ["Box Office Mojo", "Find Movie Box Office Data"],
  ["Goodreads", "Book reviews & recommendations"],
  ["IMDb", "Movies, TV & Celebrities"],
  ["Prime Video Direct", "Video Distribution Made Easy"],
  ["Shopbop", "Designer Fashion Brands"],
  ["Woot!", "Deals and Shenanigans"],
  ["Zappos", "Shoes & Clothing"],
  ["Ring", "Smart Home Security Systems"],
];

export function SiteFooter() {
  return (
    <footer className="mt-10">
      <Link
        href="#top"
        className="block bg-chrome-belt-hover py-4 text-center text-sm text-text-primary hover:brightness-95"
      >
        Back to top
      </Link>

      {/* Link columns */}
      <div className="bg-chrome-belt text-text-primary">
        <div className="mx-auto grid max-w-[1000px] gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-2 font-bold">{col.heading}</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border-default" />
        <div className="flex flex-wrap items-center justify-center gap-4 py-8">
          <AmazonLogo className="h-7 w-auto" />
          <span className="rounded border border-border-strong px-3 py-1 text-xs">
            English
          </span>
          <span className="rounded border border-border-strong px-3 py-1 text-xs">
            USD - U.S. Dollar
          </span>
          <span className="rounded border border-border-strong px-3 py-1 text-xs">
            United States
          </span>
        </div>
      </div>

      {/* Sub-brand grid — the one deliberately dark band left in the
          footer, for contrast; kept light-on-dark. */}
      <div className="bg-chrome-footer-deep text-text-inverse">
        <div className="mx-auto grid max-w-[1000px] gap-x-6 gap-y-5 px-6 py-10 text-center text-[0.7rem] leading-tight text-neutral-400 sm:grid-cols-3 lg:grid-cols-6">
          {SUB_BRANDS.map(([name, desc]) => (
            <div key={name}>
              <p className="text-neutral-200">{name}</p>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <div className="px-6 pb-10 text-center text-[0.7rem] text-neutral-400">
          <p className="space-x-3">
            <Link href="/info/conditions-of-use" className="hover:underline">
              Conditions of Use
            </Link>
            <Link href="/info/privacy-notice" className="hover:underline">
              Privacy Notice
            </Link>
            <Link href="/info/consumer-health-data" className="hover:underline">
              Consumer Health Data Privacy Disclosure
            </Link>
            <Link href="/info/ad-choices" className="hover:underline">
              Your Ads Privacy Choices
            </Link>
          </p>
          <p className="mt-2">© 1996–2026, Amazon.com, Inc. or its affiliates</p>
          <p className="mt-1 text-neutral-500">
            Demonstration build for a coding assignment · not affiliated with
            Amazon.com, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
