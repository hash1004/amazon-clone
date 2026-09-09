"use client";

import { useState } from "react";

export type AddressDraft = {
  id?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal: string;
  isDefault?: boolean;
};

export function AddressFields({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save address",
  showDefault = true,
}: {
  initial?: Partial<AddressDraft>;
  onSubmit: (form: FormData) => Promise<{ ok: boolean; error?: string }>;
  onCancel?: () => void;
  submitLabel?: string;
  showDefault?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setPending(true);
        const res = await onSubmit(new FormData(e.currentTarget));
        setPending(false);
        if (!res.ok) setError(res.error ?? "Could not save the address.");
      }}
      className="space-y-3"
    >
      {error && (
        <p className="rounded-md bg-danger-subtle p-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="fullName" label="Full name" defaultValue={initial?.fullName} required span2 />
        <Field name="phone" label="Phone number" defaultValue={initial?.phone} required span2 />
        <Field name="line1" label="Address" defaultValue={initial?.line1} required span2 />
        <Field
          name="line2"
          label="Apartment, suite, etc. (optional)"
          defaultValue={initial?.line2 ?? ""}
          span2
        />
        <Field name="city" label="City" defaultValue={initial?.city} required />
        <Field name="state" label="State" defaultValue={initial?.state} required />
        <Field name="postal" label="ZIP Code" defaultValue={initial?.postal} required />
      </div>
      {showDefault && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isDefault"
            defaultChecked={initial?.isDefault}
            className="h-4 w-4"
          />
          Make this my default address
        </label>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-pill bg-accent px-6 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-pill border border-border-strong px-6 py-1.5 text-sm hover:bg-subtle"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  defaultValue,
  span2,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  span2?: boolean;
}) {
  return (
    <label className={`block text-sm font-bold ${span2 ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-border-strong px-2 py-1.5 text-sm font-normal focus:border-border-accent focus:outline-none"
      />
    </label>
  );
}
