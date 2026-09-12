"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DEPARTMENTS } from "@/lib/departments";
import { CategoriesIcon } from "@/components/ui/icons";

/**
 * "All Categories" — hover-opens on desktop, tap-toggles on touch, closes on
 * outside click/Escape. Flat department list for now (see
 * design/redesign-v2-spec.md — nested/leaf categories are a later pass).
 */
export function CategoriesMenu() {
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

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
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
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hideSoon}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm font-medium hover:bg-black/5"
      >
        <CategoriesIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Categories</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-56 overflow-hidden rounded-md border border-border-default bg-surface py-1 shadow-lg">
          {DEPARTMENTS.map((d) => (
            <Link
              key={d.slug}
              href={`/s?dept=${d.slug}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm hover:bg-subtle"
            >
              {d.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
