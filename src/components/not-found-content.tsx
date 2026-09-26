"use client";

import { useState } from "react";
import Link from "next/link";
import { SorryMug } from "@/components/ui/sorry-mug";

const MESSAGES = [
  {
    title: "This blend doesn't exist. Yet.",
    subtitle: "Sorry, that page isn't in stock. Browse what we've actually got.",
  },
  {
    title: "Ground to dust.",
    subtitle: "This page didn't survive the roast. Head back before it's fully gone.",
  },
  {
    title: "Over-extracted.",
    subtitle: "Whatever you were looking for came out bitter and wrong. Try a fresh page.",
  },
  {
    title: "Wrong shelf.",
    subtitle: "This coffee's been moved, sold out, or never existed. Let's get you back to the good stuff.",
  },
  {
    title: "Cold cup.",
    subtitle: "This page has been sitting too long. Let's pour you a fresh one.",
  },
] as const;

export function NotFoundContent() {
  // Picked once per mount. The server-rendered HTML and the client's
  // hydration pick independently, so the text can differ — an intentional,
  // expected mismatch (not a bug), so it's marked suppressHydrationWarning
  // below rather than deferred to an effect.
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  return (
    <div className="mx-auto flex max-w-[820px] flex-col items-center gap-8 px-4 py-14 text-center sm:flex-row sm:text-left">
      <div className="shrink-0">
        <SorryMug className="h-52 w-52" />
        <p className="mt-1 text-xs text-text-muted">This roast doesn&apos;t exist</p>
      </div>

      <div>
        <h1 className="font-serif text-2xl font-medium text-text-primary sm:text-3xl" suppressHydrationWarning>
          {message.title}
        </h1>
        <p className="mt-2 text-sm text-text-secondary" suppressHydrationWarning>
          {message.subtitle}
        </p>

        <form action="/s" className="mt-5 flex max-w-sm border border-border-strong bg-surface">
          <input
            type="search"
            name="q"
            aria-label="Search"
            placeholder="Search coffee"
            className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Go
          </button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link
            href="/"
            className="bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Back to Still Coffee and Co.
          </Link>
          <Link
            href="/s"
            className="border border-border-strong px-6 py-2 text-sm hover:bg-subtle"
          >
            Browse All Coffee
          </Link>
        </div>
      </div>
    </div>
  );
}
