import Link from "next/link";
import { AmazonLogo } from "@/components/ui/amazon-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="flex justify-center border-b border-border-default py-4">
        <Link href="/">
          <AmazonLogo className="h-8 w-[105px]" tone="dark" />
        </Link>
      </div>

      <div className="mx-auto w-full max-w-[350px] flex-1 px-4 py-6">
        {children}
      </div>

      <footer className="border-t border-border-default bg-gradient-to-b from-white to-[#f3f3f3] py-6 text-center text-xs text-text-secondary">
        <p className="space-x-4">
          <Link href="#" className="link">
            Conditions of Use
          </Link>
          <Link href="#" className="link">
            Privacy Notice
          </Link>
          <Link href="#" className="link">
            Help
          </Link>
        </p>
        <p className="mt-2">© 1996–2026, Amazon.com, Inc. or its affiliates</p>
      </footer>
    </div>
  );
}
