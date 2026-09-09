export function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(input: string): string {
  return input.replace(/\D/g, "").slice(0, 4);
}

/** Luhn check — Stripe test cards (incl. the decline card) all pass. */
export function luhnValid(digits: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export type CardFields = { number: string; name: string; exp: string; cvv: string };

/** Returns a map of field -> error message; empty object means valid. */
export function validateCard(card: CardFields): Partial<Record<keyof CardFields, string>> {
  const errors: Partial<Record<keyof CardFields, string>> = {};
  const digits = card.number.replace(/\D/g, "");

  if (digits.length < 15) errors.number = "Enter a 16-digit card number.";
  else if (!luhnValid(digits)) errors.number = "That card number looks invalid.";

  if (!card.name.trim()) errors.name = "Enter the name on the card.";

  const m = card.exp.match(/^(\d{2})\/(\d{2})$/);
  if (!m) {
    errors.exp = "Use MM/YY.";
  } else {
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    const now = new Date();
    if (month < 1 || month > 12) errors.exp = "Month must be 01–12.";
    else if (
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1)
    )
      errors.exp = "Card has expired.";
  }

  if (!/^\d{3,4}$/.test(card.cvv)) errors.cvv = "3 or 4 digits.";

  return errors;
}

export function validateUpi(id: string): string | null {
  if (!/^[\w.\-]{2,}@[a-z]{2,}$/i.test(id.trim()))
    return "Enter a valid UPI ID (name@bank).";
  return null;
}
