/**
 * What each address / payment text field may contain. Used twice: the
 * sanitizers run as you type (so a name field simply won't take digits),
 * and the validators run on submit in the browser AND on the server — the
 * server copy is the one that counts, the browser copy is for instant
 * feedback.
 */

// Letters in any script (so "José", "Zoë", "अब्दुल" are fine), plus the
// punctuation real names use.
const NAME_CHARS = /[^\p{L}\p{M} .'-]/gu;
// Street lines need digits (house / flat numbers) and a little punctuation.
const ADDRESS_CHARS = /[^\p{L}\p{M}\p{N} .,'#/()&-]/gu;
const PHONE_CHARS = /[^0-9+()\s-]/g;
// Non-global twins for .test() — a /g regex keeps state between calls.
const NOT_NAME = /[^\p{L}\p{M} .'-]/u;

export const sanitize = {
  name: (v: string) => v.replace(NAME_CHARS, "").replace(/\s{2,}/g, " ").slice(0, 60),
  place: (v: string) => v.replace(NAME_CHARS, "").replace(/\s{2,}/g, " ").slice(0, 40),
  address: (v: string) => v.replace(ADDRESS_CHARS, "").replace(/\s{2,}/g, " ").slice(0, 100),
  phone: (v: string) => v.replace(PHONE_CHARS, "").slice(0, 20),
  postal: (v: string) => v.replace(/\D/g, "").slice(0, 6),
};

export type SanitizeKind = keyof typeof sanitize;

const hasLetter = (v: string) => /\p{L}/u.test(v);
const digitCount = (v: string) => (v.match(/\d/g) ?? []).length;

export type AddressInput = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal: string;
};

export type AddressErrors = Partial<Record<keyof AddressInput, string>>;

/** Field → message for everything wrong; an empty object means valid. */
export function validateAddress(a: AddressInput): AddressErrors {
  const e: AddressErrors = {};
  const name = a.fullName.trim();
  if (!name) e.fullName = "Enter a full name.";
  else if (NOT_NAME.test(name) || !hasLetter(name) || name.length < 2)
    e.fullName = "Use letters only (spaces, . ' - are fine).";

  const phone = a.phone.trim();
  if (!phone) e.phone = "Enter a phone number.";
  else if (/[^0-9+()\s-]/.test(phone) || digitCount(phone) < 7 || digitCount(phone) > 15)
    e.phone = "Enter a valid phone number (7–15 digits).";

  const line1 = a.line1.trim();
  if (!line1) e.line1 = "Enter a street address.";
  else if (line1.length < 3 || !hasLetter(line1)) e.line1 = "Include the street name, not just numbers.";

  const line2 = (a.line2 ?? "").trim();
  if (line2 && /[^\p{L}\p{M}\p{N} .,'#/()&-]/u.test(line2)) e.line2 = "Remove special characters.";

  for (const k of ["city", "state"] as const) {
    const v = a[k].trim();
    const label = k === "city" ? "city" : "state";
    if (!v) e[k] = `Enter a ${label}.`;
    else if (NOT_NAME.test(v) || !hasLetter(v)) e[k] = "Use letters only.";
  }

  const postal = a.postal.trim();
  if (!postal) e.postal = "Enter a ZIP or PIN code.";
  else if (!/^\d{5,6}$/.test(postal)) e.postal = "Use a 5-digit ZIP or 6-digit PIN code.";

  return e;
}

/** Name on a card: letters, spaces and . ' - only. */
export function validateCardName(v: string): string | null {
  const name = v.trim();
  if (!name) return "Enter the name on the card.";
  if (NOT_NAME.test(name) || !hasLetter(name)) return "Use letters only.";
  return null;
}
