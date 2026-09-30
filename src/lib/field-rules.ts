/**
 * What each address / payment text field may contain. Used twice: the
 * sanitizers run as you type (so a name field simply won't take digits),
 * and the validators run on submit in the browser AND on the server — the
 * server copy is the one that counts, the browser copy is for instant
 * feedback.
 */

import { isUsState } from "@/lib/us-states";

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
  phone: (v: string) => v.replace(PHONE_CHARS, "").slice(0, 17),
  // ZIP or ZIP+4: digits, one hyphen.
  postal: (v: string) => v.replace(/[^\d-]/g, "").replace(/-(?=.*-)/g, "").slice(0, 10),
};

export type SanitizeKind = keyof typeof sanitize;

const hasLetter = (v: string) => /\p{L}/u.test(v);

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
  const phoneDigits = phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  if (!phone) e.phone = "Enter a phone number.";
  else if (/[^0-9+()\s.-]/.test(phone) || phoneDigits.length !== 10)
    e.phone = "Enter a 10-digit US phone number.";

  const line1 = a.line1.trim();
  if (!line1) e.line1 = "Enter a street address.";
  else if (line1.length < 3 || !hasLetter(line1)) e.line1 = "Include the street name, not just numbers.";

  const line2 = (a.line2 ?? "").trim();
  if (line2 && /[^\p{L}\p{M}\p{N} .,'#/()&-]/u.test(line2)) e.line2 = "Remove special characters.";

  const city = a.city.trim();
  if (!city) e.city = "Enter a city.";
  else if (NOT_NAME.test(city) || !hasLetter(city)) e.city = "Use letters only.";

  if (!a.state.trim()) e.state = "Choose a state.";
  else if (!isUsState(a.state)) e.state = "Choose a US state.";

  const postal = a.postal.trim();
  if (!postal) e.postal = "Enter a ZIP code.";
  else if (!/^\d{5}(-\d{4})?$/.test(postal)) e.postal = "Use a 5-digit ZIP code (or ZIP+4).";

  return e;
}

/** Name on a card: letters, spaces and . ' - only. */
export function validateCardName(v: string): string | null {
  const name = v.trim();
  if (!name) return "Enter the name on the card.";
  if (NOT_NAME.test(name) || !hasLetter(name)) return "Use letters only.";
  return null;
}
