"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type Result = { ok: true; id?: string } | { ok: false; error: string };

function readForm(form: FormData) {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  return {
    fullName: get("fullName"),
    phone: get("phone"),
    line1: get("line1"),
    line2: get("line2") || null,
    city: get("city"),
    state: get("state"),
    postal: get("postal"),
    country: get("country") || "US",
    isDefault: form.get("isDefault") === "on" || form.get("isDefault") === "true",
  };
}

function validate(a: ReturnType<typeof readForm>): string | null {
  if (!a.fullName) return "Enter a full name.";
  if (!/^[0-9+\-\s()]{7,}$/.test(a.phone)) return "Enter a valid phone number.";
  if (!a.line1) return "Enter a street address.";
  if (!a.city || !a.state || !a.postal) return "Complete city, state and ZIP.";
  return null;
}

export async function createAddress(form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  const data = readForm(form);
  const err = validate(data);
  if (err) return { ok: false, error: err };

  const count = await db.address.count({ where: { userId: session.user.id } });
  const makeDefault = data.isDefault || count === 0;

  if (makeDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }
  const created = await db.address.create({
    data: { ...data, isDefault: makeDefault, userId: session.user.id },
  });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true, id: created.id };
}

export async function updateAddress(id: string, form: FormData): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  const owned = await db.address.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!owned) return { ok: false, error: "Address not found." };

  const data = readForm(form);
  const err = validate(data);
  if (err) return { ok: false, error: err };

  if (data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }
  await db.address.update({
    where: { id },
    data: { ...data, isDefault: data.isDefault || owned.isDefault },
  });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true, id };
}

export async function deleteAddress(id: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  const owned = await db.address.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!owned) return { ok: false, error: "Address not found." };

  await db.address.delete({ where: { id } });
  if (owned.isDefault) {
    const next = await db.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
    if (next)
      await db.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
  }
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };
  const owned = await db.address.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!owned) return { ok: false, error: "Address not found." };

  await db.address.updateMany({
    where: { userId: session.user.id },
    data: { isDefault: false },
  });
  await db.address.update({ where: { id }, data: { isDefault: true } });
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}
