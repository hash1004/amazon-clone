import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeaderShell } from "@/components/header-shell";
import { AuthedProvider } from "@/lib/auth-context";

/**
 * Same header/footer/structure as the shop layout — a separately-styled
 * auth chrome meant the sign-in flow never quite matched the rest of the
 * site, and its own nested flex wrapper (min-h-full inside body's own
 * min-h-full) never actually resolved to a real height, so the footer
 * sat right under a short form instead of at the bottom of the viewport.
 * Reusing the exact shop-layout structure (main as a direct flex child of
 * body, footer as its sibling) fixes both at once.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AuthedProvider value={!!session?.user}>
      <HeaderShell>
        <SiteHeader />
      </HeaderShell>
      <main className="w-full min-w-0 flex-1 overflow-x-clip">
        <div className="mx-auto w-full max-w-[350px] px-4 py-10">{children}</div>
      </main>
      <SiteFooter />
    </AuthedProvider>
  );
}
