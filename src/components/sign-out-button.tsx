"use client";

import { signOut } from "next-auth/react";

/** Shared sign-out action — used by both the desktop account dropdown
 * and the full account page (the mobile entry point via the bottom nav). */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className ?? "text-left hover:text-text-accent hover:underline"}
    >
      Sign Out
    </button>
  );
}
