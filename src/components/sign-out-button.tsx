"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="block text-sm font-bold hover:underline"
    >
      Sign out
    </button>
  );
}
