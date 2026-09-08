import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { PRICE_BUCKETS } from "@/lib/product-display";
import { searchUrl, type SearchParams } from "@/lib/search-query";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border-default py-3 last:border-0">
      <h3 className="mb-1.5 text-sm font-bold text-text-primary">{title}</h3>
      {children}
    </div>
  );
}

export function FilterRail({
  params,
  brands,
}: {
  params: SearchParams;
  brands: { brand: string; count: number }[];
}) {
  return (
    <aside className="hidden w-52 shrink-0 text-sm lg:block">
      <Section title="Department">
        <ul className="space-y-1">
          <li>
            <Link
              href={searchUrl(params, { dept: undefined, page: undefined })}
              className={params.dept ? "link" : "font-bold"}
            >
              All departments
            </Link>
          </li>
          {DEPARTMENTS.map((d) => (
            <li key={d.slug}>
              <Link
                href={searchUrl(params, { dept: d.slug, page: undefined })}
                className={params.dept === d.slug ? "font-bold" : "link"}
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Customer Reviews">
        {[4, 3].map((r) => (
          <Link
            key={r}
            href={searchUrl(params, {
              rating: params.rating === String(r) ? undefined : String(r),
              page: undefined,
            })}
            className="flex items-center gap-1"
          >
            <span className="text-warning" aria-hidden>
              {"★".repeat(r)}
              <span className="text-border-strong">{"★".repeat(5 - r)}</span>
            </span>
            <span
              className={params.rating === String(r) ? "font-bold" : "text-text-secondary"}
            >
              &amp; Up
            </span>
          </Link>
        ))}
      </Section>

      <Section title="Price">
        <ul className="space-y-1">
          {PRICE_BUCKETS.map((b) => {
            const active =
              params.min === (b.min ? String(b.min) : undefined) &&
              params.max === (b.max ? String(b.max) : undefined);
            return (
              <li key={b.label}>
                <Link
                  href={searchUrl(params, {
                    min: b.min ? String(b.min) : undefined,
                    max: b.max ? String(b.max) : undefined,
                    page: undefined,
                  })}
                  className={active ? "font-bold" : "link"}
                >
                  {b.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {brands.length > 0 && (
        <Section title="Brands">
          <ul className="space-y-1">
            {brands.map((b) => (
              <li key={b.brand}>
                <Link
                  href={searchUrl(params, {
                    brand: params.brand === b.brand ? undefined : b.brand,
                    page: undefined,
                  })}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 shrink-0 rounded-sm border ${
                      params.brand === b.brand
                        ? "border-border-accent bg-border-accent"
                        : "border-border-strong"
                    }`}
                  />
                  <span
                    className={
                      params.brand === b.brand ? "font-bold" : "text-text-secondary"
                    }
                  >
                    {b.brand}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Deals">
        <Link
          href={searchUrl(params, {
            deals: params.deals ? undefined : "1",
            page: undefined,
          })}
          className={params.deals ? "font-bold" : "link"}
        >
          {params.deals ? "✓ " : ""}On sale only
        </Link>
      </Section>
    </aside>
  );
}
