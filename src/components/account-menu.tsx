"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { PersonIcon } from "@/components/ui/icons";

export function AccountMenu({
  isAuthed,
  firstName,
}: {
  isAuthed: boolean;
  firstName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
      onFocusCapture={show}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Link
        href={isAuthed ? "/account" : "/login"}
        onClick={() => setOpen(false)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={isAuthed ? `Account, ${firstName}` : "Account, sign in"}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
      >
        <PersonIcon className="h-5 w-5" />
      </Link>

      {open && (
        <div className="absolute right-0 top-full z-50 w-64 rounded-md border border-border-default bg-surface p-3 text-text-primary shadow-xl">
          {!isAuthed && (
            <div className="mb-2 flex flex-col items-center gap-1 border-b border-border-default pb-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-pill bg-accent px-4 py-1.5 text-center text-sm font-medium text-accent-fg hover:bg-accent-hover"
              >
                Sign in
              </Link>
              <p className="text-xs text-text-secondary">
                New customer?{" "}
                <Link href="/signup" onClick={() => setOpen(false)} className="link">
                  Start here.
                </Link>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="mb-1 font-bold">Your Lists</p>
              <ul className="space-y-1 text-text-secondary">
                <li>
                  <MenuLink href="/wishlist" onNav={() => setOpen(false)}>
                    Your List
                  </MenuLink>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-1 font-bold">Your Account</p>
              <ul className="space-y-1 text-text-secondary">
                <li>
                  <MenuLink href="/account" onNav={() => setOpen(false)}>
                    Account
                  </MenuLink>
                </li>
                <li>
                  <MenuLink href="/account/orders" onNav={() => setOpen(false)}>
                    Orders
                  </MenuLink>
                </li>
                <li>
                  <MenuLink href="/account/addresses" onNav={() => setOpen(false)}>
                    Addresses
                  </MenuLink>
                </li>
                {isAuthed && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="text-left hover:text-text-accent hover:underline"
                    >
                      Sign Out
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onNav,
  children,
}: {
  href: string;
  onNav: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNav}
      className="hover:text-text-accent hover:underline"
    >
      {children}
    </Link>
  );
}
