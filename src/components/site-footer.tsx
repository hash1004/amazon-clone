import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Reveal } from "@/components/ui/reveal";

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
    <footer className="grain bg-brown-gradient mt-10 text-text-on-brown">
      <Reveal className="mx-auto max-w-[1400px] px-6 pb-14 pt-16 sm:px-10 sm:pt-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand tier: wordmark bold/bright, tagline muted/lighter below it */}
          <div>
            <Link href="/" className="inline-block">
              <BrandLogo className="h-8 w-auto" tone="light" />
            </Link>
            <p className="mt-3 max-w-[22ch] text-sm font-normal text-text-on-brown-muted">
              Coffee, slowly considered.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                {/* Heading tier matches the wordmark: bright + heavier weight */}
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-on-brown">
                  {col.heading}
                </h3>
                <ul className="space-y-2 text-sm text-text-on-brown-muted">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="hover:text-text-on-brown hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="border-t border-border-on-brown px-6 py-6 text-center text-xs text-text-on-brown-muted sm:px-10">
        <p className="flex flex-wrap items-center justify-center gap-x-2">
          <Link href="/info/privacy-notice" className="hover:underline">
            Privacy Policy
          </Link>
          <span aria-hidden>·</span>
          <Link href="/info/conditions-of-use" className="hover:underline">
            Terms of Use
          </Link>
        </p>
        <p className="mt-2">© 2026 Still Coffee and Co.</p>
      </div>
    </footer>
  );
}
