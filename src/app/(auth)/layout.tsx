import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-8">
      <Link href="/" className="mb-4 text-2xl font-bold">
        amazon<span className="text-accent-buy">.clone</span>
      </Link>
      {children}
    </div>
  );
}
