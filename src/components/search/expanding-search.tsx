"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { SearchIcon } from "@/components/ui/icons";

type Suggestion =
  | { kind: "term"; text: string }
  | { kind: "brand"; text: string }
  | { kind: "department"; slug: string; text: string }
  | { kind: "product"; slug: string; title: string; image: string };

/**
 * Search icon that expands into an input on hover/focus, collapses back
 * when it loses focus empty. Categories live in their own left-side menu
 * now, so this is just query text + autocomplete — no department select.
 */
export function ExpandingSearch() {
  const router = useRouter();
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const items = q.trim().length < 2 ? [] : results;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<AbortController | null>(null);

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

  const openWide = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const collapseIfIdle = () => {
    if (document.activeElement !== inputRef.current) {
      setOpen(false);
      setExpanded(false);
    }
  };

  const go = (s: Suggestion) => {
    setOpen(false);
    setQ(s.kind === "product" ? s.title : s.text);
    if (s.kind === "product") router.push(`/p/${s.slug}`);
    else if (s.kind === "department") router.push(`/s?dept=${s.slug}`);
    else router.push(`/s?q=${encodeURIComponent(s.text)}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(items[active]);
    if (!q.trim()) return;
    setOpen(false);
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

  return (
    <div
      ref={rootRef}
      onMouseEnter={openWide}
      onMouseLeave={collapseIfIdle}
      className={`relative flex items-center transition-[width] duration-200 ease-out ${
        expanded ? "w-56 sm:w-72" : "w-9"
      }`}
    >
      <form onSubmit={submit} className="flex w-full items-center">
        <button
          type={expanded ? "submit" : "button"}
          aria-label="Search"
          onClick={() => !expanded && openWide()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="search"
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
          onFocus={openWide}
          onKeyDown={onKeyDown}
          className={`min-w-0 flex-1 border-none bg-transparent px-1 text-sm text-text-primary outline-none transition-opacity duration-150 ${
            expanded ? "opacity-100" : "pointer-events-none w-0 opacity-0"
          }`}
        />
      </form>

      {expanded && open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-md border border-border-default bg-surface text-text-primary shadow-lg"
        >
          {items.map((s, i) => (
            <li
              key={i}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                go(s);
              }}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${
                i === active ? "bg-accent-subtle" : ""
              }`}
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
      )}
    </div>
  );
}
