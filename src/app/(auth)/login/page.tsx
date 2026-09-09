"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Wrong email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-medium">Sign in</h1>
      {error && (
        <p className="mb-3 rounded-md bg-danger-subtle p-2 text-sm text-danger">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-bold">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-border-strong px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm font-bold">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-border-strong px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-pill bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 border-t border-border-default pt-3 text-sm">
        New to Amazon?{" "}
        <Link href="/signup" className="link">
          Create your account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
