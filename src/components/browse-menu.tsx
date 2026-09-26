"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { CategoriesIcon, SearchIcon, CloseIcon, ArrowLeftIcon } from "@/components/ui/icons";

type Suggestion =
  | { kind: "term"; text: string }
  | { kind: "origin"; text: string }
  | { kind: "roast"; slug: string; text: string }
  | { kind: "product"; slug: string; title: string; image: string };

const SHOP_LINKS = [
  { label: "All Coffee", href: "/s" },
  { label: "Light Roasts", href: "/s?roast=light" },
  { label: "Medium Roasts", href: "/s?roast=medium" },
  { label: "Dark Roasts", href: "/s?roast=dark" },
  { label: "Our Story", href: "/info/about" },
];

const MOBILE_QUERY = "(max-width: 639px)";

type View = "menu" | "search";

/**
 * Left-side hamburger. On phones: full-screen (no room for a contained
 * dropdown, and nothing else to see behind it anyway). On wider screens:
 * a compact panel anchored under the icon instead of taking over the
 * whole viewport for a 6-item list. Both use the same brown/grain block
 * as the header — a plain white panel read as a generic modal that had
 * nothing to do with the rest of the site.
 */
export function BrowseMenu() {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<AbortController | null>(null);
  const items = q.trim().length < 2 ? [] : results;

  const close = () => {
    setOpen(false);
    setEntered(false);
    setView("menu");
    setQ("");
  };
  const openMenu = () => setOpen(true);
  const openSearch = () => setView("search");
  const backToMenu = () => setView("menu");

  const go = (s: Suggestion) => {
    close();
    if (s.kind === "product") router.push(`/p/${s.slug}`);
    else if (s.kind === "roast") router.push(`/s?roast=${s.slug}`);
    else router.push(`/s?q=${encodeURIComponent(s.text)}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    close();
    router.push(`/s?q=${encodeURIComponent(q.trim())}`);
  };

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(async () => {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, {
          signal: ac.signal,
        });
        const data = (await res.json()) as {
          products: { slug: string; title: string; image: string }[];
          origins: string[];
          roastLevels: { slug: string; label: string }[];
        };
        setResults([
          ...data.roastLevels.map((r) => ({ kind: "roast" as const, slug: r.slug, text: r.label })),
          ...data.origins.map((o) => ({ kind: "origin" as const, text: o })),
          ...data.products.map((p) => ({
            kind: "product" as const,
            slug: p.slug,
            title: p.title,
            image: p.image,
          })),
        ]);
      } catch {
        /* aborted or offline */
      }
    }, 140);
    return () => clearTimeout(t);
  }, [q]);

  // Enter transition — mount first, then flip the visible class a frame
  // later so the opacity/translate change actually animates instead of
  // snapping straight to its end state.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Scroll lock only matters for the full-screen mobile version — a
  // compact desktop dropdown shouldn't freeze the whole page.
  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    if (isMobile) document.body.classList.add("scroll-locked");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("scroll-locked");
      window.removeEventListener("keydown", onKey);
    };
     
  }, [open]);

  // Desktop only: click outside closes it. On mobile the panel is a
  // full-screen takeover, so there's no "outside" to click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (window.matchMedia(MOBILE_QUERY).matches) return;
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
     
  }, [open]);

  useEffect(() => {
    if (open && view === "search") requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, view]);

  const panelBase =
    "grain flex flex-col bg-chrome-nav text-text-on-brown transition-all duration-200 ease-out " +
    "fixed inset-0 h-dvh w-full " +
    "sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 sm:h-auto sm:max-h-[70vh] sm:w-80 " +
    "sm:overflow-hidden sm:border sm:border-border-on-brown sm:shadow-lg " +
    (entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1");

  return (
    <div
      ref={rootRef}
      className="relative"
      style={{ ["--icon-hover-bg" as string]: "rgba(243, 234, 217, 0.14)" }}
    >
      <button
        type="button"
        aria-label="Menu"
        onClick={openMenu}
        className="icon-hover flex h-9 w-9 items-center justify-center rounded-full"
      >
        <CategoriesIcon className="h-5 w-5" />
      </button>

      {open && view === "menu" && (
        <div className={`${panelBase} z-[70]`}>
          <div className="flex shrink-0 items-center justify-between border-b border-border-on-brown px-4 py-3">
            <span className="font-serif text-lg font-medium">Menu</span>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="icon-hover flex h-9 w-9 items-center justify-center rounded-full"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-2 sm:flex-none">
            <ul className="flex flex-col">
              <li>
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex w-full items-center gap-3 border-b border-border-on-brown py-3 text-left font-serif text-lg hover:text-accent-primary sm:text-base"
                >
                  <SearchIcon className="h-4 w-4 shrink-0 text-text-on-brown-muted" />
                  Search
                </button>
              </li>
              {SHOP_LINKS.map((l) => (
                <li key={l.href} className="border-b border-border-on-brown last:border-0">
                  <Link
                    href={l.href}
                    onClick={close}
                    className="block py-3 font-serif text-lg hover:text-accent-primary sm:text-base"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {open && view === "search" && (
        <div className={`${panelBase} z-[70]`}>
          <form
            onSubmit={submit}
            className="flex shrink-0 items-center gap-2 border-b border-border-on-brown px-4 py-3"
          >
            <button
              type="button"
              aria-label="Back"
              onClick={backToMenu}
              className="icon-hover flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <div className="flex flex-1 items-center gap-2 bg-subtle px-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoComplete="off"
                role="combobox"
                aria-label="Search coffee"
                aria-expanded={items.length > 0}
                aria-controls={listId}
                aria-autocomplete="list"
                placeholder="Search coffee"
                className="min-w-0 flex-1 border-none bg-transparent py-2 text-sm text-text-primary outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="icon-hover flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </form>

          {items.length > 0 ? (
            <ul id={listId} role="listbox" className="flex-1 overflow-y-auto sm:max-h-[50vh]">
              {items.map((s, i) => (
                <li
                  key={i}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    go(s);
                  }}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-white/10"
                >
                  {s.kind === "product" ? (
                    <>
                      <span className="relative h-8 w-8 shrink-0 bg-subtle">
                        {s.image && (
                          <Image src={s.image} alt="" fill sizes="32px" className="object-cover" />
                        )}
                      </span>
                      <span className="line-clamp-1">{s.title}</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4 shrink-0 text-text-on-brown-muted" />
                      <span>
                        {s.text}
                        {s.kind === "origin" && (
                          <span className="ml-1 text-xs text-text-on-brown-muted">· origin</span>
                        )}
                        {s.kind === "roast" && (
                          <span className="ml-1 text-xs text-text-on-brown-muted">· roast</span>
                        )}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex-1 px-4 py-6 text-center text-sm text-text-on-brown-muted sm:flex-none">
              {q.trim().length >= 2 ? "No matches yet." : "Search by coffee, origin, or roast level."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
