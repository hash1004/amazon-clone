"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { DEPARTMENTS, DEPARTMENT_BY_SLUG } from "@/lib/departments";
import { SearchIcon } from "@/components/ui/icons";

type Suggestion =
  | { kind: "term"; text: string }
  | { kind: "brand"; text: string }
  | { kind: "department"; slug: string; text: string }
  | { kind: "product"; slug: string; title: string; image: string };

export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const items = q.trim().length < 2 ? [] : results;
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<AbortController | null>(null);

  // Debounced fetch
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(async () => {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(term)}${
            dept ? `&dept=${dept}` : ""
          }`,
          { signal: ac.signal },
        );
        const data = (await res.json()) as {
          products: { slug: string; title: string; image: string }[];
          brands: string[];
          departments: { slug: string; label: string }[];
        };
        const next: Suggestion[] = [
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
        ];
        setResults(next);
        setActive(-1);
      } catch {
        /* aborted or offline */
      }
    }, 140);
    return () => clearTimeout(t);
  }, [q, dept]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (s: Suggestion) => {
    setOpen(false);
    if (s.kind === "product") {
      router.push(`/p/${s.slug}`);
    } else if (s.kind === "department") {
      router.push(`/s?dept=${s.slug}`);
    } else {
      const params = new URLSearchParams({ q: s.text });
      if (dept) params.set("dept", dept);
      router.push(`/s?${params.toString()}`);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) {
      go(items[active]);
      return;
    }
    if (!q.trim()) return;
    setOpen(false);
    const params = new URLSearchParams({ q: q.trim() });
    if (dept) params.set("dept", dept);
    router.push(`/s?${params.toString()}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={boxRef}
      className="relative order-last w-full min-w-0 sm:order-none sm:w-auto sm:flex-1"
    >
      <form
        action="/s"
        onSubmit={submit}
        className="flex h-10 items-stretch overflow-hidden rounded-md ring-accent-buy focus-within:ring-3"
      >
        <select
          name="dept"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          aria-label="Search in department"
          className="hidden shrink-0 border-r border-border-default bg-subtle px-2 text-xs text-text-primary outline-none hover:bg-chrome-belt-hover sm:block"
        >
          <option value="">All</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.label}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={q}
          autoComplete="off"
          role="combobox"
          aria-label="Search Amazon"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          placeholder="Search Amazon"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-white px-3 text-sm text-text-primary outline-none"
        />
        <button
          type="submit"
          aria-label="Go"
          className="flex shrink-0 items-center bg-chrome-search-btn px-3.5 text-accent-fg hover:bg-chrome-search-btn-hover"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-0.5 overflow-hidden rounded-md border border-border-default bg-surface text-text-primary shadow-lg"
        >
          {items.map((s, i) => (
            <li
              key={i}
              id={`${listId}-${i}`}
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
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
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
                      <span className="ml-1 text-xs text-text-secondary">
                        · brand
                      </span>
                    )}
                    {s.kind === "department" && (
                      <span className="ml-1 text-xs text-text-secondary">
                        · department
                      </span>
                    )}
                    {s.kind === "term" && dept && DEPARTMENT_BY_SLUG[dept] && (
                      <span className="ml-1 text-xs text-text-secondary">
                        in {DEPARTMENT_BY_SLUG[dept].label}
                      </span>
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
