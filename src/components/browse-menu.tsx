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

type View = "menu" | "search";

/**
 * Left-side hamburger — opens a menu list first (Search is just the top
 * item, not an input shoved in your face immediately); tapping it drills
 * into a second full-screen view with the actual search input +
 * autocomplete. Two steps, not one panel doing both jobs at once.
 */
export function BrowseMenu() {
  const router = useRouter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<AbortController | null>(null);
  const items = q.trim().length < 2 ? [] : results;

  const close = () => {
    setOpen(false);
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

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("scroll-locked");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("scroll-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && view === "search") requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, view]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={openMenu}
        className="icon-hover flex h-9 w-9 items-center justify-center rounded-full"
      >
        <CategoriesIcon className="h-5 w-5" />
      </button>

      {open && view === "menu" && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-surface">
          <div className="flex shrink-0 items-center justify-between border-b border-border-default px-4 py-3">
            <span className="font-serif text-lg font-medium text-text-primary">Menu</span>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-subtle"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="flex flex-col">
              <li>
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex w-full items-center gap-3 border-b border-border-default py-3 text-left font-serif text-xl text-text-primary hover:text-text-accent"
                >
                  <SearchIcon className="h-5 w-5 shrink-0 text-text-muted" />
                  Search
                </button>
              </li>
              {SHOP_LINKS.map((l) => (
                <li key={l.href} className="border-b border-border-default last:border-0">
                  <Link
                    href={l.href}
                    onClick={close}
                    className="block py-3 font-serif text-xl text-text-primary hover:text-text-accent"
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
        <div className="fixed inset-0 z-[70] flex flex-col bg-surface">
          <form
            onSubmit={submit}
            className="flex shrink-0 items-center gap-2 border-b border-border-default px-4 py-3"
          >
            <button
              type="button"
              aria-label="Back"
              onClick={backToMenu}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-subtle"
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
                className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-base text-text-primary outline-none"
              />
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-subtle"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </form>

          {items.length > 0 ? (
            <ul id={listId} role="listbox" className="flex-1 overflow-y-auto">
              {items.map((s, i) => (
                <li
                  key={i}
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    go(s);
                  }}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-subtle"
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
                      <SearchIcon className="h-4 w-4 shrink-0 text-text-muted" />
                      <span>
                        {s.text}
                        {s.kind === "origin" && (
                          <span className="ml-1 text-xs text-text-secondary">· origin</span>
                        )}
                        {s.kind === "roast" && (
                          <span className="ml-1 text-xs text-text-secondary">· roast</span>
                        )}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex-1 px-4 py-6 text-center text-sm text-text-secondary">
              {q.trim().length >= 2 ? "No matches yet." : "Search by coffee, origin, or roast level."}
            </p>
          )}
        </div>
      )}
    </>
  );
}
