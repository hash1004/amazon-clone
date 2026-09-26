import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

/**
 * This layout deliberately drops the full header/footer chrome for a
 * focused sign-in screen. But it lives in its own route group outside
 * (shop), so on phones it was never getting the bottom nav either —
 * landing here (e.g. Wishlist redirects here when signed out) meant
 * the bottom nav just vanished with no way back except browser-back.
 * Keep the bottom nav so it never fully strands a mobile user.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-surface pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="flex justify-start border-b border-border-default px-4 py-4 sm:justify-center sm:px-0">
        <Link href="/">
          <BrandLogo className="h-9 w-auto" tone="dark" />
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
        <p className="mt-2">© 2026 Still Coffee Co.</p>
      </footer>

      <MobileBottomNav />
    </div>
  );
}
