"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sticky header wrapper that slides out of view on scroll-down and back in on
 * scroll-up (like the Amazon app header).
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last.current;
        if (y < 120) {
          setHidden(false);
        } else if (delta > 6) {
          setHidden(true);
        } else if (delta < -6) {
          setHidden(false);
        }
        last.current = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 transition-transform duration-200 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {children}
    </div>
  );
}
