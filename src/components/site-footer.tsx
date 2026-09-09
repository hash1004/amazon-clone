import Link from "next/link";
import { AmazonLogo } from "@/components/ui/amazon-logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Get to Know Us",
    links: [
      { label: "About the build", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Investor Relations", href: "#" },
    ],
  },
  {
    heading: "Make Money with Us",
    links: [
      { label: "Sell products", href: "#" },
      { label: "Become an Affiliate", href: "#" },
      { label: "Advertise Your Products", href: "#" },
      { label: "Self-Publish with Us", href: "#" },
    ],
  },
  {
    heading: "Payment Products",
    links: [
      { label: "Business Card", href: "#" },
      { label: "Shop with Points", href: "#" },
      { label: "Reload Your Balance", href: "#" },
      { label: "Currency Converter", href: "#" },
    ],
  },
  {
    heading: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Your Orders", href: "/account/orders" },
      { label: "Your Cart", href: "/cart" },
      { label: "Shipping Rates & Policies", href: "#" },
      { label: "Help", href: "#" },
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
    <footer className="mt-10 text-white">
      <Link
        href="#top"
        className="block bg-chrome-belt-hover py-4 text-center text-sm hover:brightness-110"
      >
        Back to top
      </Link>

      {/* Link columns */}
      <div className="bg-chrome-belt">
        <div className="mx-auto grid max-w-[1000px] gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-2 font-bold">{col.heading}</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
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
        <div className="border-t border-white/15" />
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

      {/* Sub-brand grid */}
      <div className="bg-chrome-footer-deep">
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
            <span>Conditions of Use</span>
            <span>Privacy Notice</span>
            <span>Consumer Health Data Privacy Disclosure</span>
            <span>Your Ads Privacy Choices</span>
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
