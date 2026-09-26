"use client";

// Replaces the root layout when that layout itself fails, so it brings its
// own <html>/<body> and stylesheet rather than relying on the layout's.
import "./globals.css";
import { SorryMug } from "@/components/ui/sorry-mug";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-canvas px-4 text-center text-text-primary antialiased">
        <div className="flex flex-col items-center">
          <SorryMug className="h-44 w-44" />
          <h1 className="mt-4 font-serif text-2xl font-medium">Spilled the pour.</h1>
          <p className="mt-2 text-sm text-text-secondary">Something went wrong on our end. Give it another go.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
            >
              Try again
            </button>
            {/* Plain <a>, not <Link>: a full reload is the point when the app shell broke. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="border border-border-strong px-6 py-2 text-sm hover:bg-subtle">
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
