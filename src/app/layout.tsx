import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-store";
import { WishlistProvider } from "@/lib/wishlist-store";
import { RecentlyViewedProvider } from "@/lib/recently-viewed";
import { ToastProvider } from "@/lib/toast";

// Amazon Ember is proprietary; Inter is the closest free grotesque.
const ember = Inter({
  variable: "--font-ember",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://amazon-clone-sgtc.vercel.app",
  ),
  title: {
    default: "Amazon.com. Spend less. Smile more.",
    template: "Amazon.com: %s",
  },
  description:
    "Online shopping from a great selection at a low price. Free shipping on qualifying orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ember.variable} h-full`}>
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
