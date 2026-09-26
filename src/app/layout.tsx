import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-store";
import { WishlistProvider } from "@/lib/wishlist-store";
import { RecentlyViewedProvider } from "@/lib/recently-viewed";
import { ToastProvider } from "@/lib/toast";

// Sharper, more structural than the old Work Sans — squarer terminals,
// pairs with the sharp-corner UI instead of fighting it.
const body = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Display — wordmark + headlines. Upright, not italic: Fraunces' pointed,
// high-contrast serif reads as confident/edged at weight, where the old
// italic Newsreader read soft and literary — same "considered" register,
// less "soft old-style curves."
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://stillcoffeeandco.svdistributor.com",
  ),
  title: {
    default: "Still Coffee and Co. — One coffee, done well.",
    template: "Still Coffee and Co.: %s",
  },
  description:
    "Small-batch specialty coffee, roasted to order and shipped within 48 hours of roasting.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-canvas text-text-primary antialiased">
        <span id="top" />
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
