import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeaderShell } from "@/components/header-shell";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderShell>
        <SiteHeader />
      </HeaderShell>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
