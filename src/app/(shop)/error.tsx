"use client";

import Link from "next/link";
import { SorryMug } from "@/components/ui/sorry-mug";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-[820px] flex-col items-center gap-8 px-4 py-14 text-center sm:flex-row sm:text-left">
      <SorryMug className="h-52 w-52 shrink-0" />

      <div>
        <h1 className="font-serif text-2xl font-medium text-text-primary sm:text-3xl">Spilled the pour.</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Something went wrong loading this page. Give it another go.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
          <button
            type="button"
            onClick={reset}
            className="bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Try again
          </button>
          <Link href="/" className="border border-border-strong px-6 py-2 text-sm hover:bg-subtle">
            Back to Still Coffee and Co.
          </Link>
        </div>
      </div>
    </div>
  );
}
