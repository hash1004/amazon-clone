"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReview } from "@/lib/review-actions";
import { GRINDS } from "@/lib/variants";

const STAR_WORDS = ["", "Not for me", "Okay", "Good", "Great", "Loved it"];

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        if (!rating) {
          setError("Choose a star rating.");
          return;
        }
        form.set("rating", String(rating));
        form.set("productId", productId);
        setPending(true);
        const res = await createReview(form);
        setPending(false);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.refresh();
      }}
      className="space-y-3"
    >
      <p className="text-sm font-medium text-text-primary">Write a review</p>

      <fieldset>
        <legend className="text-xs text-text-secondary">Your rating</legend>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer px-0.5 text-2xl leading-none">
                <input
                  type="radio"
                  name="stars"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="peer sr-only"
                  aria-label={`${n} star${n > 1 ? "s" : ""}: ${STAR_WORDS[n]}`}
                />
                <span
                  aria-hidden
                  className={`peer-focus-visible:outline-2 peer-focus-visible:outline-border-accent ${
                    n <= rating ? "text-text-accent" : "text-border-strong"
                  }`}
                >
                  ★
                </span>
              </label>
            ))}
          </div>
          <span className="text-xs text-text-secondary">{STAR_WORDS[rating]}</span>
        </div>
      </fieldset>

      <label className="block text-xs text-text-secondary">
        Title
        <input
          name="title"
          maxLength={80}
          required
          className="mt-1 w-full border border-border-strong bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-border-accent focus:outline-none"
        />
      </label>

      <label className="block text-xs text-text-secondary">
        Your review
        <textarea
          name="body"
          rows={4}
          maxLength={1500}
          required
          placeholder="How did it taste, and how did you brew it?"
          className="mt-1 w-full border border-border-strong bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-border-accent focus:outline-none"
        />
      </label>

      <label className="block text-xs text-text-secondary">
        Grind you bought (optional)
        <select
          name="grind"
          defaultValue=""
          className="mt-1 w-full border border-border-strong bg-surface px-2 py-1.5 text-sm text-text-primary focus:border-border-accent focus:outline-none"
        >
          <option value="">Prefer not to say</option>
          {GRINDS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p role="alert" className="bg-danger-subtle p-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-control bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
