"use client";

import { useState } from "react";
import {
  sanitize,
  validateAddress,
  type AddressErrors,
  type SanitizeKind,
} from "@/lib/field-rules";

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
  const [fieldErrors, setFieldErrors] = useState<AddressErrors>({});
  const [pending, setPending] = useState(false);
  const clear = (k: keyof AddressErrors) =>
    setFieldErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const form = new FormData(e.currentTarget);
        const get = (k: string) => String(form.get(k) ?? "");
        const errs = validateAddress({
          fullName: get("fullName"),
          phone: get("phone"),
          line1: get("line1"),
          line2: get("line2"),
          city: get("city"),
          state: get("state"),
          postal: get("postal"),
        });
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setPending(true);
        const res = await onSubmit(form);
        setPending(false);
        if (!res.ok) setError(res.error ?? "Could not save the address.");
      }}
      noValidate
      className="space-y-3"
    >
      {error && <p className="rounded-md bg-danger-subtle p-2 text-sm text-danger">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          name="fullName"
          label="Full name"
          kind="name"
          autoComplete="name"
          defaultValue={initial?.fullName}
          error={fieldErrors.fullName}
          onEdit={clear}
          required
          span2
        />
        <Field
          name="phone"
          label="Phone number"
          kind="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={initial?.phone}
          error={fieldErrors.phone}
          onEdit={clear}
          required
          span2
        />
        <Field
          name="line1"
          label="Address"
          kind="address"
          autoComplete="address-line1"
          defaultValue={initial?.line1}
          error={fieldErrors.line1}
          onEdit={clear}
          required
          span2
        />
        <Field
          name="line2"
          label="Apartment, suite, etc. (optional)"
          kind="address"
          autoComplete="address-line2"
          defaultValue={initial?.line2 ?? ""}
          error={fieldErrors.line2}
          onEdit={clear}
          span2
        />
        <Field
          name="city"
          label="City"
          kind="place"
          autoComplete="address-level2"
          defaultValue={initial?.city}
          error={fieldErrors.city}
          onEdit={clear}
          required
        />
        <Field
          name="state"
          label="State"
          kind="place"
          autoComplete="address-level1"
          defaultValue={initial?.state}
          error={fieldErrors.state}
          onEdit={clear}
          required
        />
        <Field
          name="postal"
          label="ZIP / PIN code"
          kind="postal"
          inputMode="numeric"
          autoComplete="postal-code"
          defaultValue={initial?.postal}
          error={fieldErrors.postal}
          onEdit={clear}
          required
        />
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
          className="rounded-control bg-accent px-6 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-control border border-border-strong px-6 py-1.5 text-sm hover:bg-subtle"
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
  kind,
  required,
  defaultValue,
  span2,
  error,
  onEdit,
  type = "text",
  inputMode,
  autoComplete,
}: {
  name: keyof AddressErrors;
  label: string;
  /** Which characters the field accepts as you type — see field-rules. */
  kind: SanitizeKind;
  required?: boolean;
  defaultValue?: string;
  span2?: boolean;
  error?: string;
  onEdit: (name: keyof AddressErrors) => void;
  type?: "text" | "tel";
  inputMode?: "text" | "tel" | "numeric";
  autoComplete?: string;
}) {
  return (
    <label className={`block text-sm font-bold ${span2 ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        onInput={(e) => {
          const el = e.currentTarget;
          const clean = sanitize[kind](el.value);
          if (clean !== el.value) el.value = clean;
          onEdit(name);
        }}
        className={`mt-1 w-full border px-2 py-1.5 text-sm font-normal focus:outline-none ${
          error
            ? "border-danger focus:border-danger"
            : "border-border-strong focus:border-border-accent"
        }`}
      />
      {error && <span className="mt-0.5 block text-xs font-normal text-danger">{error}</span>}
    </label>
  );
}
