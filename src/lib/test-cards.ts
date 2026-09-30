/** Test card numbers (Stripe's): the success card and the decline card. */
export const TEST_CARD = {
  number: "4242 4242 4242 4242",
  name: "Test Customer",
  cvv: "123",
} as const;

/** Any card number ending in these digits is declined in test mode. */
export const DECLINE_SUFFIX = "0002";

export const TEST_CARD_NUMBERS = new Set(["4242424242424242", "4000000000000002"]);

/** An expiry two years out, so the filled-in test card never goes stale. */
export function testCardExpiry(now = new Date()): string {
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String((now.getFullYear() + 2) % 100).padStart(2, "0");
  return `${mm}/${yy}`;
}
