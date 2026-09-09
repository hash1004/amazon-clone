import Link from "next/link";
import { AmazonLogo } from "@/components/ui/amazon-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-8">
      <Link href="/" className="mb-4">
        <AmazonLogo className="h-8 w-[105px]" tone="dark" />
      </Link>
      {children}
    </div>
  );
}
