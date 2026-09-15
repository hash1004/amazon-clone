import Link from "next/link";
import type { Metadata } from "next";
import { DEPARTMENTS } from "@/lib/departments";
import { ChevronRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "All Categories" };

/**
 * Full-page department browser — the mobile bottom nav's "Categories"
 * tab points here instead of opening the desktop hover flyout, since a
 * dropdown is a poor fit for touch. Same flat department list as the
 * desktop CategoriesMenu (no nested/leaf categories yet — that's a
 * later pass, see categories-menu.tsx).
 */
export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-[700px] px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">All Categories</h1>
      <div className="flex flex-col divide-y divide-border-default rounded-lg border border-border-default bg-surface">
        {DEPARTMENTS.map((d) => (
          <Link
            key={d.slug}
            href={`/s?dept=${d.slug}`}
            className="flex items-center gap-3 px-4 py-4 hover:bg-subtle"
          >
            <span className="text-xl" aria-hidden>
              {d.emoji}
            </span>
            <span className="flex-1 font-medium">{d.label}</span>
            <ChevronRightIcon className="h-4 w-4 text-text-secondary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
