import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeaderShell } from "@/components/header-shell";
import { BackToTop } from "@/components/back-to-top";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AuthedProvider } from "@/lib/auth-context";

export default async function ShopLayout({
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
      <main className="w-full min-w-0 flex-1 overflow-x-clip pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pb-0">
        {children}
      </main>
      <div className="hidden sm:block">
        <SiteFooter />
      </div>
      <BackToTop />
      <MobileBottomNav />
    </AuthedProvider>
  );
}
