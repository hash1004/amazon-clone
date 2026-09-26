"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PersonIcon } from "@/components/ui/icons";
import { SignOutButton } from "@/components/sign-out-button";

/** Desktop-only account trigger — hover/click dropdown with sign-in or account links. */
export function AccountMenu({
  isAuthed,
  firstName,
}: {
  isAuthed: boolean;
  firstName?: string | null;
}) {
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

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={isAuthed ? `Account, ${firstName}` : "Account, sign in"}
        className="icon-hover flex h-9 w-9 items-center justify-center rounded-full"
      >
        <PersonIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 w-56 border border-border-default bg-surface p-3 text-text-primary shadow-xl">
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
      )}
    </div>
  );
}
