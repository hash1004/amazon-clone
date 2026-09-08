"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
    };

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create your account.");
      setPending(false);
      return;
    }

    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full rounded-lg border border-border-default bg-surface p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-medium">Create account</h1>
      {error && (
        <p className="mb-3 rounded-md bg-danger-subtle p-2 text-sm text-danger">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-bold">
          Your name
          <input
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-border-strong px-2 py-1.5 text-sm"
          />
        </label>
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
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-border-strong px-2 py-1.5 text-sm"
          />
          <span className="mt-1 block text-xs font-normal text-text-secondary">
            At least 6 characters.
          </span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-pill bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create your account"}
        </button>
      </form>

      <p className="mt-4 border-t border-border-default pt-3 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
