"use client";

import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { priceParts } from "@/lib/format";

export function RecentlyViewedRow({
  excludeId,
  title = "Your recently viewed items",
}: {
  excludeId?: string;
  title?: string;
}) {
  const { items } = useRecentlyViewed();
  const list = items.filter((i) => i.productId !== excludeId);
  if (list.length === 0) return null;

  return (
    <section className="bg-surface p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {list.map((p) => {
          const { whole, frac } = priceParts(p.priceCents);
          return (
            <Link
              key={p.productId}
              href={`/p/${p.slug}`}
              className="group w-32 shrink-0"
            >
              <div className="relative mb-1 aspect-square w-full bg-white">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="128px"
                  className="object-contain p-1 group-hover:scale-105"
                />
              </div>
              <p className="line-clamp-2 text-xs group-hover:text-text-accent">
                {p.title}
              </p>
              <p className="text-sm">
                <span className="align-super text-[0.6rem]">$</span>
                <span className="font-medium">{whole}</span>
                <span className="align-super text-[0.6rem]">{frac}</span>
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
