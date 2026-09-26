"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/format";
import { CartIcon } from "@/components/ui/icons";
import { PulseDot } from "@/components/ui/pulse-dot";
import { SignOutButton } from "@/components/sign-out-button";

/**
 * One icon, right side of the header — replaces separate search/account/
 * wishlist/cart icons (and the mobile bottom nav) with a single outline
 * cart trigger whose panel holds cart contents, the wishlist link, and
 * account/sign-in. Fewer things competing for attention in the chrome;
 * everything shopping-related lives behind one door.
 */
export function ShopMenu({
  isAuthed,
  firstName,
}: {
  isAuthed: boolean;
  firstName?: string | null;
}) {
  const { lines, count: cartCount, subtotalCents, ready: cartReady } = useCart();
  const { count: wishCount, ready: wishReady } = useWishlist();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hasCartItems = cartReady && cartCount > 0;
  const hasWishItems = wishReady && wishCount > 0;

  return (
    <div ref={rootRef} className="relative shrink-0" onMouseEnter={show} onMouseLeave={hideSoon}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Cart, wishlist and account${hasCartItems ? `, ${cartCount} items in cart` : ""}`}
        className="icon-hover relative flex h-9 w-9 items-center justify-center rounded-full"
      >
        <CartIcon className="h-5 w-5" />
        {(hasCartItems || hasWishItems) && <PulseDot />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 w-72 border border-border-default bg-surface p-4 text-text-primary shadow-xl">
          <div className="border-b border-border-default pb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Cart {hasCartItems && `(${cartCount})`}
            </p>
            {hasCartItems ? (
              <>
                <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                  {lines.slice(0, 3).map((l) => (
                    <li key={l.productId} className="line-clamp-1">
                      {l.quantity}× {l.title}
                    </li>
                  ))}
                  {lines.length > 3 && <li>+{lines.length - 3} more</li>}
                </ul>
                <p className="mt-2 text-sm font-medium">{formatPrice(subtotalCents)} subtotal</p>
                <Link
                  href="/cart"
                  onClick={close}
                  className="mt-2 block rounded-pill bg-accent px-4 py-1.5 text-center text-xs font-medium text-accent-fg hover:bg-accent-hover"
                >
                  View Cart
                </Link>
              </>
            ) : (
              <p className="mt-1.5 text-sm text-text-secondary">Your cart is empty.</p>
            )}
          </div>

          <Link
            href="/wishlist"
            onClick={close}
            className="flex items-center justify-between border-b border-border-default py-3 text-sm hover:text-text-accent"
          >
            <span>Your List</span>
            {hasWishItems && <span className="text-text-secondary">{wishCount}</span>}
          </Link>

          <div className="pt-3">
            {!isAuthed ? (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="block rounded-pill bg-accent px-4 py-1.5 text-center text-sm font-medium text-accent-fg hover:bg-accent-hover"
                >
                  Sign in
                </Link>
                <p className="mt-2 text-xs text-text-secondary">
                  New here?{" "}
                  <Link href="/signup" onClick={close} className="link">
                    Create your account
                  </Link>
                </p>
              </>
            ) : (
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li className="mb-1 font-medium text-text-primary">
                  {firstName ? `Hi, ${firstName}` : "Your Account"}
                </li>
                <li>
                  <Link href="/account" onClick={close} className="hover:text-text-accent">
                    Account
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" onClick={close} className="hover:text-text-accent">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link href="/account/addresses" onClick={close} className="hover:text-text-accent">
                    Addresses
                  </Link>
                </li>
                <li>
                  <SignOutButton className="text-left hover:text-text-accent hover:underline" />
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
