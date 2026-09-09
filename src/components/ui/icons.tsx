type P = { className?: string };

export function SearchIcon({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CartIcon({ className = "h-7 w-7" }: P) {
  return (
    <svg viewBox="0 0 36 32" className={className} fill="currentColor" aria-hidden>
      <path d="M8.5 24.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm16 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM0 2c0-.6.4-1 1-1h4.3c.9 0 1.7.6 1.9 1.5L7.9 6H34c1.3 0 2.3 1.3 1.9 2.6l-3.6 12A3 3 0 0 1 29.4 23H10.2a3 3 0 0 1-2.9-2.3L3.4 3H1c-.6 0-1-.4-1-1Z" />
    </svg>
  );
}

export function PinIcon({ className = "h-4 w-4" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.4.3.9.3 1.3 0 .3-.3 7.4-6.4 7.4-11.8 0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-3 w-3" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
