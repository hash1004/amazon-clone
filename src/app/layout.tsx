import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-store";

// Amazon Ember is proprietary; Inter is the closest free grotesque.
const ember = Inter({
  variable: "--font-ember",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Amazon.com. Spend less. Smile more.",
    template: "%s | Amazon clone",
  },
  description:
    "A working slice of amazon.com — browse, search, cart, and checkout. Built as a timed assignment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ember.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-canvas text-text-primary antialiased">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
