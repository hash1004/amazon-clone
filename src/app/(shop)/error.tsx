"use client";

import Link from "next/link";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[600px] px-4 py-16 text-center">
      <p className="text-4xl">😕</p>
      <h1 className="mt-3 text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-text-secondary">
        We hit a snag loading this page. Please try again.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-pill border border-border-strong px-6 py-2 text-sm hover:bg-subtle"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}
