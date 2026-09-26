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
      <Reveal className="px-6 pb-14 pt-16 sm:px-10 sm:pt-20">
        <p className="max-w-[18ch] font-serif text-3xl leading-[1.15] tracking-tight sm:max-w-[22ch] sm:text-4xl">
          Coffee, slowly considered.
        </p>

        <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <Link href="/" className="inline-block">
            <BrandLogo className="h-8 w-auto" tone="light" />
          </Link>

          <div className="flex flex-wrap gap-10 sm:gap-16">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-on-brown-muted">
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
        <p className="mt-2">© 2026 Still Coffee Co.</p>
      </div>
    </footer>
  );
}
