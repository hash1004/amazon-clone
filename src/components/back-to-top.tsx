"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/ui/icons";

const SHOW_AFTER_PX = 480;

/** Floating scroll-to-top button — replaces the old "Back to top" text
 * link at the head of the footer. Appears once you've actually scrolled
 * down, not before. Hidden on phones: the bottom nav already occupies
 * that corner of the screen and a second floating control there would
 * crowd it. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-border-default bg-surface text-text-primary shadow-lg transition-all duration-200 hover:scale-105 hover:bg-subtle sm:flex ${
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
