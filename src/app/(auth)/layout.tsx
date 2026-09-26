import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

/**
 * This layout deliberately drops the full header/footer chrome for a
 * focused sign-in screen — the logo above the form is the only way back
 * home, which is enough now that there's no bottom nav to fall back to.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <div className="flex justify-start border-b border-border-default px-4 py-4 sm:justify-center sm:px-0">
        <Link href="/">
          <BrandLogo className="h-7 w-auto" tone="dark" />
        </Link>
      </div>

      <div className="mx-auto w-full max-w-[350px] flex-1 px-4 py-6">
        {children}
      </div>

      <footer className="border-t border-border-default bg-gradient-to-b from-surface to-subtle py-6 text-center text-xs text-text-secondary">
        <p className="space-x-4">
          <Link href="/info/conditions-of-use" className="link">
            Conditions of Use
          </Link>
          <Link href="/info/privacy-notice" className="link">
            Privacy Notice
          </Link>
          <Link href="/info/help" className="link">
            Help
          </Link>
        </p>
        <p className="mt-2">© 2026 Still Coffee and Co.</p>
      </footer>
    </div>
  );
}
