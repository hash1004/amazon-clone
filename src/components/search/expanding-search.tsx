"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { SearchIcon, CloseIcon, ArrowLeftIcon } from "@/components/ui/icons";

type Suggestion =
  | { kind: "term"; text: string }
  | { kind: "brand"; text: string }
  | { kind: "department"; slug: string; text: string }
  | { kind: "product"; slug: string; title: string; image: string };

const MOBILE_QUERY = "(max-width: 639px)";

/**
 * Search icon that expands into an input on hover/focus (desktop) or opens
 * a full-screen search screen (phones — there's no room to grow an inline
 * field next to account/wishlist/cart in a ~360px header row, and a phone
 * keyboard wants the whole screen anyway, not a 224px sliver).
 *
 * `type="text"`, not `type="search"` — the native search input decorations
 * (WebKit's round clear-button, the platform's own rounded chrome) aren't
 * ours to style consistently across browsers, and read as a stray icon/
 * border we didn't put there. Plain text input, our own pill background.
 */
export function ExpandingSearch() {
  const router = useRouter();
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const items = q.trim().length < 2 ? [] : results;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<AbortController | null>(null);

  // Hover only ever changes the *visual* width — it never steals focus.
  // Only a deliberate click (or real keyboard-Tab focus) puts the caret
  // in the field.
  const expand = () => setExpanded(true);
  const openSearch = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMobileOpen(true);
      return;
    }
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const closeMobile = () => {
    setMobileOpen(false);
    setOpen(false);
  };

  const collapseIfIdle = () => {
    // A field with something in it (typed, or left over from a search)
    // stays open when the pointer leaves — only an empty, unfocused field
    // collapses back to just the icon.
    if (document.activeElement !== inputRef.current && !q.trim()) {
      setOpen(false);
      setExpanded(false);
    }
  };

  const go = (s: Suggestion) => {
    setOpen(false);
    setQ(s.kind === "product" ? s.title : s.text);
    inputRef.current?.blur();
    setMobileOpen(false);
    if (s.kind === "product") router.push(`/p/${s.slug}`);
    else if (s.kind === "department") router.push(`/s?dept=${s.slug}`);
    else router.push(`/s?q=${encodeURIComponent(s.text)}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(items[active]);
    if (!q.trim()) return;
    setOpen(false);
    inputRef.current?.blur();
    setMobileOpen(false);
    router.push(`/s?q=${encodeURIComponent(q.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      if (!q.trim()) setExpanded(false);
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    }
  };

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(async () => {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(term)}`,
          { signal: ac.signal },
        );
        const data = (await res.json()) as {
          products: { slug: string; title: string; image: string }[];
          brands: string[];
          departments: { slug: string; label: string }[];
        };
        setResults([
          { kind: "term", text: term },
          ...data.departments.map((d) => ({
            kind: "department" as const,
            slug: d.slug,
            text: d.label,
          })),
          ...data.brands.map((b) => ({ kind: "brand" as const, text: b })),
          ...data.products.map((p) => ({
            kind: "product" as const,
            slug: p.slug,
            title: p.title,
            image: p.image,
          })),
        ]);
        setActive(-1);
      } catch {
        /* aborted or offline */
      }
    }, 140);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!expanded) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        if (!q.trim()) setExpanded(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [expanded, q]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.classList.add("scroll-locked");
    requestAnimationFrame(() => mobileInputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMobile();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("scroll-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      <div
        ref={rootRef}
        onMouseEnter={expand}
        onMouseLeave={collapseIfIdle}
        className={`relative flex items-center rounded-full bg-subtle transition-[width] duration-200 ease-out ${
          expanded ? "w-56 sm:w-72" : "w-9"
        }`}
      >
        <form onSubmit={submit} className="flex w-full items-center">
          <button
            type={expanded ? "submit" : "button"}
            aria-label="Search"
            onClick={openSearch}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={q}
            autoComplete="off"
            role="combobox"
            aria-label="Search Amazon"
            aria-expanded={open && items.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            placeholder="Search Amazon"
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={expand}
            onKeyDown={onKeyDown}
            className={`search-input min-w-0 flex-1 border-none bg-transparent px-1 text-sm text-text-primary outline-none transition-opacity duration-150 ${
              expanded ? "opacity-100" : "pointer-events-none w-0 opacity-0"
            }`}
          />
          {expanded && q && (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQ("");
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-black/5 hover:text-text-primary"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {expanded && open && items.length > 0 && (
          <SuggestionList
            listId={listId}
            items={items}
            active={active}
            compact
            onHover={setActive}
            onPick={go}
          />
        )}
      </div>

      {mobileOpen && (
        // h-dvh, not inset-0/100vh — a `fixed` element doesn't reflow when
        // the on-screen keyboard opens, so with a plain 100vh height the
        // bottom of this overlay (where the suggestion list lives, below
        // the input) ends up anchored past where the keyboard now covers
        // the screen: present in the DOM, just not actually on screen.
        // dvh is the viewport unit that actually accounts for the keyboard.
        <div className="fixed inset-x-0 top-0 z-[60] flex h-dvh flex-col bg-surface sm:hidden">
          <form
            onSubmit={submit}
            className="flex shrink-0 items-center gap-2 border-b border-border-default px-3 py-2.5"
          >
            <button
              type="button"
              aria-label="Close search"
              onClick={closeMobile}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-subtle px-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-text-muted" />
              <input
                ref={mobileInputRef}
                type="text"
                value={q}
                autoComplete="off"
                role="combobox"
                aria-label="Search Amazon"
                aria-expanded={items.length > 0}
                aria-controls={listId}
                aria-autocomplete="list"
                placeholder="Search Amazon"
                onChange={(e) => setQ(e.target.value)}
                className="search-input min-w-0 flex-1 border-none bg-transparent py-2.5 text-base text-text-primary outline-none"
              />
              {q && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQ("");
                    mobileInputRef.current?.focus();
                  }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-black/10"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>

          {items.length > 0 ? (
            <SuggestionList
              listId={listId}
              items={items}
              active={active}
              compact={false}
              onHover={setActive}
              onPick={go}
            />
          ) : (
            <p className="p-4 text-center text-sm text-text-secondary">
              {q.trim().length >= 2
                ? "No matches yet."
                : "Search for products, brands, or a department."}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function SuggestionList({
  listId,
  items,
  active,
  compact,
  onHover,
  onPick,
}: {
  listId: string;
  items: Suggestion[];
  active: number;
  compact: boolean;
  onHover: (i: number) => void;
  onPick: (s: Suggestion) => void;
}) {
  return (
    <ul
      id={listId}
      role="listbox"
      className={
        compact
          ? "absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-md border border-border-default bg-surface text-text-primary shadow-lg"
          : "flex-1 overflow-y-auto"
      }
    >
      {items.map((s, i) => (
        <li
          key={i}
          role="option"
          aria-selected={i === active}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(s);
          }}
          className={`flex cursor-pointer items-center gap-3 px-3 text-sm ${
            compact ? "py-2" : "py-3"
          } ${i === active ? "bg-accent-subtle" : ""}`}
        >
          {s.kind === "product" ? (
            <>
              <span className="relative h-8 w-8 shrink-0 bg-white">
                {s.image && (
                  <Image src={s.image} alt="" fill sizes="32px" className="object-contain" />
                )}
              </span>
              <span className="line-clamp-1">{s.title}</span>
            </>
          ) : (
            <>
              <SearchIcon className="h-4 w-4 shrink-0 text-text-muted" />
              <span>
                {s.text}
                {s.kind === "brand" && (
                  <span className="ml-1 text-xs text-text-secondary">· brand</span>
                )}
                {s.kind === "department" && (
                  <span className="ml-1 text-xs text-text-secondary">· department</span>
                )}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
