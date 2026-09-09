import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeaderShell } from "@/components/header-shell";
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
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </AuthedProvider>
  );
}
