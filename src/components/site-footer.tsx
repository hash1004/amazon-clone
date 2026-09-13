import Link from "next/link";
import { AmazonLogo } from "@/components/ui/amazon-logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Get to know us",
    links: [
      { label: "About", href: "/info/about" },
      { label: "Careers", href: "/info/careers" },
      { label: "Blog", href: "/info/blog" },
    ],
  },
  {
    heading: "Categories",
    links: [
      { label: "Electronics", href: "/s?dept=electronics" },
      { label: "Home & Kitchen", href: "/s?dept=home-kitchen" },
      { label: "Fashion", href: "/s?dept=fashion" },
      { label: "Beauty", href: "/s?dept=beauty" },
      { label: "Sports & Outdoors", href: "/s?dept=sports-outdoors" },
    ],
  },
  {
    heading: "Let us help you",
    links: [
      { label: "Your Account", href: "/account" },
      { label: "Your Orders", href: "/account/orders" },
      { label: "Your Cart", href: "/cart" },
      { label: "Shipping & Policies", href: "/info/shipping-policy" },
      { label: "Help", href: "/info/help" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 bg-chrome-footer-deep text-text-inverse">
      <Link
        href="#top"
        className="block border-b border-white/10 py-3 text-center text-sm hover:bg-white/5"
      >
        Back to top
      </Link>

      <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <AmazonLogo className="h-7 w-auto" tone="light" />
            <p className="mt-3 max-w-[22ch] text-sm text-neutral-400">
              A calmer way to shop — categorization and quiet deals-in-context,
              not banners.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-sm font-semibold">{col.heading}</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-text-inverse hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs">
            English
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs">
            USD - U.S. Dollar
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs">
            United States
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-neutral-500 sm:px-10">
        <p className="space-x-3">
          <Link href="/info/conditions-of-use" className="hover:underline">
            Conditions of Use
          </Link>
          <Link href="/info/privacy-notice" className="hover:underline">
            Privacy Notice
          </Link>
          <Link href="/info/ad-choices" className="hover:underline">
            Your Ads Privacy Choices
          </Link>
        </p>
        <p className="mt-2">© 1996–2026, Amazon.com, Inc. or its affiliates</p>
        <p className="mt-1 text-neutral-600">
          Demonstration build for a coding assignment · not affiliated with
          Amazon.com, Inc.
        </p>
      </div>
    </footer>
  );
}
