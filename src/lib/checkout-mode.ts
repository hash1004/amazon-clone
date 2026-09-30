/**
 * Checkout test mode. Payments are mocked (no processor is wired up), so
 * test mode is ON unless CHECKOUT_TEST_MODE is set to "false". In test
 * mode checkout shows a "Test mode" banner and a button that fills in the
 * test card, and the decline card is honoured. With it off, the test-card
 * hints disappear and the orders API refuses test card numbers — the
 * switch to flip once real payments exist.
 *
 * Read at request time (not NEXT_PUBLIC_*), so it's set on the running
 * service rather than baked into the build.
 */
export function checkoutTestMode(): boolean {
  return process.env.CHECKOUT_TEST_MODE !== "false";
}
