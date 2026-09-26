import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "The roastery",
    links: [
      { label: "Our Story", href: "/info/about" },
      { label: "How We Roast", href: "/info/blog" },
      { label: "Careers", href: "/info/careers" },
    ],
  },
  {
    heading: "Your account",
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
      <div className="px-6 py-14 sm:px-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="inline-block">
              <BrandLogo className="h-7 w-auto" tone="light" />
            </Link>
            <p className="mt-3 max-w-[22ch] text-sm text-neutral-400">
              One coffee, done well — small-batch roasted, shipped within 48
              hours of roasting.
            </p>
          </div>
          <div className="flex flex-wrap gap-10 sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {col.heading}
                </h3>
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
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-neutral-500 sm:px-10">
        <p className="flex flex-wrap items-center justify-center gap-x-2">
          <Link href="/info/privacy-notice" className="hover:underline">
            Privacy Policy
          </Link>
          <span aria-hidden>·</span>
          <Link href="/info/conditions-of-use" className="hover:underline">
            Terms of Use
          </Link>
        </p>
        <p className="mt-2">© 2026 Still Coffee Co.</p>
      </div>
    </footer>
  );
}
