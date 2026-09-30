import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INFO_PAGES } from "@/lib/info-pages";

export function generateStaticParams() {
  return Object.keys(INFO_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: INFO_PAGES[slug]?.title ?? "Page not found" };
}

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = INFO_PAGES[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-text-secondary">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="link">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page">{page.title}</li>
        </ol>
      </nav>

      <h1 className="font-serif text-3xl font-medium text-text-primary">{page.title}</h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">{page.intro}</p>

      <div className="mt-8 space-y-8">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-serif text-xl font-medium text-text-primary">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-2 text-sm leading-relaxed text-text-primary">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-border-default pt-6">
        <Link
          href="/s"
          className="inline-block rounded-control bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Shop coffee
        </Link>
      </div>
    </div>
  );
}
