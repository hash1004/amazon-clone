"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DEPARTMENTS } from "@/lib/departments";

export function MobileMenu({ userName }: { userName?: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1 rounded-sm px-2 py-2 hover:bg-white/10 lg:hidden"
      >
        <span aria-hidden className="flex flex-col gap-[3px]">
          <span className="block h-[2px] w-4 bg-white" />
          <span className="block h-[2px] w-4 bg-white" />
          <span className="block h-[2px] w-4 bg-white" />
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <nav className="absolute left-0 top-0 flex h-[100dvh] w-[85%] max-w-sm flex-col overflow-y-auto bg-surface text-text-primary shadow-xl">
            <div className="flex items-center justify-between bg-chrome-belt px-4 py-3 text-white">
              <span className="font-bold">
                Hello, {userName ?? "sign in"}
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            <Group title="Shop by Department">
              {DEPARTMENTS.map((d) => (
                <Item
                  key={d.slug}
                  href={`/s?dept=${d.slug}`}
                  onClick={() => setOpen(false)}
                >
                  {d.label}
                </Item>
              ))}
              <Item href="/s?deals=1" onClick={() => setOpen(false)}>
                Today&apos;s Deals
              </Item>
            </Group>

            <Group title="Your Account">
              {userName ? (
                <>
                  <Item href="/account" onClick={() => setOpen(false)}>
                    Your Account
                  </Item>
                  <Item href="/account/orders" onClick={() => setOpen(false)}>
                    Your Orders
                  </Item>
                  <Item href="/account/addresses" onClick={() => setOpen(false)}>
                    Your Addresses
                  </Item>
                </>
              ) : (
                <Item href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Item>
              )}
              <Item href="/wishlist" onClick={() => setOpen(false)}>
                Your List
              </Item>
              <Item href="/cart" onClick={() => setOpen(false)}>
                Your Cart
              </Item>
            </Group>
          </nav>
          </div>,
          document.body,
        )}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-default py-2">
      <p className="px-4 py-2 text-sm font-bold">{title}</p>
      <ul>{children}</ul>
    </div>
  );
}

function Item({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="block px-4 py-2.5 text-sm hover:bg-subtle"
      >
        {children}
      </Link>
    </li>
  );
}
