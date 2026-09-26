import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeaderShell } from "@/components/header-shell";
import { BackToTop } from "@/components/back-to-top";
import { AuthedProvider } from "@/lib/auth-context";
import { WishlistProvider } from "@/lib/wishlist-store";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AuthedProvider value={!!session?.user}>
      <WishlistProvider userId={session?.user?.id ?? null}>
        <HeaderShell>
          <SiteHeader />
        </HeaderShell>
        <main className="w-full min-w-0 flex-1 overflow-x-clip">{children}</main>
        <SiteFooter />
        <BackToTop />
      </WishlistProvider>
    </AuthedProvider>
  );
}
