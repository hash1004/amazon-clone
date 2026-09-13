/** Small pulsing dot — signals "this is non-empty" without a numeric badge. */
export function PulseDot() {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
      <span className="motion-safe:absolute motion-safe:inline-flex motion-safe:h-full motion-safe:w-full motion-safe:animate-ping motion-safe:rounded-full motion-safe:bg-accent motion-safe:opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
    </span>
  );
}
