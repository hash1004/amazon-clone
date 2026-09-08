import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[700px] px-4 py-16 text-center">
      <p className="text-5xl font-bold">🐶</p>
      <h1 className="mt-4 text-2xl font-bold">
        Looking for something?
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        We&apos;re sorry. The web address you entered is not a functioning page
        on our site.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-pill bg-accent px-6 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
      >
        Go to the Amazon clone home page
      </Link>
    </div>
  );
}
