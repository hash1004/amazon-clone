"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressFields } from "@/components/checkout/address-form";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/address-actions";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal: string;
  isDefault: boolean;
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(addresses.length === 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {addresses.map((a) =>
        editing === a.id ? (
          <div
            key={a.id}
            className="rounded-lg border border-border-default bg-surface p-4 sm:col-span-2"
          >
            <p className="mb-2 font-bold">Edit address</p>
            <AddressFields
              initial={a}
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
              onSubmit={async (form) => {
                const res = await updateAddress(a.id, form);
                if (res.ok) {
                  setEditing(null);
                  router.refresh();
                }
                return res;
              }}
            />
          </div>
        ) : (
          <div
            key={a.id}
            className="flex flex-col rounded-lg border border-border-default bg-surface p-4 text-sm"
          >
            {a.isDefault && (
              <span className="mb-1 text-xs font-bold text-text-secondary">
                Default address
              </span>
            )}
            <p className="font-bold">{a.fullName}</p>
            <p className="text-text-secondary">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.state} {a.postal}
              <br />
              Phone: {a.phone}
            </p>
            <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs">
              <button onClick={() => setEditing(a.id)} className="link">
                Edit
              </button>
              <button
                onClick={async () => {
                  await deleteAddress(a.id);
                  router.refresh();
                }}
                className="link"
              >
                Remove
              </button>
              {!a.isDefault && (
                <button
                  onClick={async () => {
                    await setDefaultAddress(a.id);
                    router.refresh();
                  }}
                  className="link"
                >
                  Set as default
                </button>
              )}
            </div>
          </div>
        ),
      )}

      {adding ? (
        <div className="rounded-lg border border-border-default bg-surface p-4 sm:col-span-2">
          <p className="mb-2 font-bold">Add a new address</p>
          <AddressFields
            onCancel={addresses.length ? () => setAdding(false) : undefined}
            onSubmit={async (form) => {
              const res = await createAddress(form);
              if (res.ok) {
                setAdding(false);
                router.refresh();
              }
              return res;
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border-strong p-4 text-sm text-text-accent hover:bg-subtle"
        >
          + Add a new address
        </button>
      )}
    </div>
  );
}
