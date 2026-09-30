import Link from "next/link";
import type { Metadata } from "next";
import { BREW_GUIDES } from "@/lib/brew-guides";

export const metadata: Metadata = { title: "Brew guides" };

export default function BrewIndexPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-10">
      <h1 className="font-serif text-3xl font-medium text-text-primary">Brew guides</h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-text-secondary">
        Starting recipes for every way you might brew our coffee, with the grind to choose if
        you buy it ground.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {BREW_GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/brew/${g.slug}`}
              className="flex h-full flex-col border border-border-default bg-surface p-5 transition-colors hover:border-border-accent"
            >
              <span className="font-serif text-xl font-medium text-text-primary">{g.name}</span>
              <span className="mt-1 text-sm text-text-secondary">{g.summary}</span>
              <span className="mt-3 text-xs text-text-secondary">
                {g.ratio} · {g.time} · {g.grindDescription.split(",")[0]} grind
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
