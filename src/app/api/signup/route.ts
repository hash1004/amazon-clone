import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, password } = (body ?? {}) as Record<string, unknown>;
  const cleanEmail = String(email ?? "")
    .toLowerCase()
    .trim();
  const cleanName = String(name ?? "").trim();
  const cleanPassword = String(password ?? "");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (cleanPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const existing = await db.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(cleanPassword, 10);
  await db.user.create({
    data: {
      email: cleanEmail,
      name: cleanName || null,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true });
}
