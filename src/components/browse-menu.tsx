"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { CategoriesIcon, SearchIcon, CloseIcon } from "@/components/ui/icons";

type Suggestion =
  | { kind: "term"; text: string }
  | { kind: "origin"; text: string }
  | { kind: "roast"; slug: string; text: string }
  | { kind: "product"; slug: string; title: string; image: string };

const ROAST_LINKS = [
  { label: "All Coffee", href: "/s" },
  { label: "Light Roasts", href: "/s?roast=light" },
  { label: "Medium Roasts", href: "/s?roast=medium" },
  { label: "Dark Roasts", href: "/s?roast=dark" },
];

/**
 * Left-side hamburger — opens a full-screen browse panel: search up top,
 * roast-level links below. Replaces the old header search pill entirely;
 * there's no separate department nav to anchor a flyout to (single
 * category), so search + roast browsing share one entry point instead of
 * competing for header space with cart/wishlist/account icons.
 */
export function BrowseMenu() {
  const router = useRouter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<AbortController | null>(null);
  const items = q.trim().length < 2 ? [] : results;

  const close = () => setOpen(false);

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
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("scroll-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Browse and search"
        onClick={() => setOpen(true)}
        className="icon-hover flex h-9 w-9 items-center justify-center rounded-full"
      >
        <CategoriesIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-surface">
          <form
            onSubmit={submit}
            className="flex shrink-0 items-center gap-2 border-b border-border-default px-4 py-3"
          >
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
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
                Shop
              </p>
              <ul className="flex flex-col gap-1">
                {ROAST_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={close}
                      className="block py-2 font-serif text-xl text-text-primary hover:text-text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/info/about"
                    onClick={close}
                    className="block py-2 font-serif text-xl text-text-primary hover:text-text-accent"
                  >
                    Our Story
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
    </>
  );
}
