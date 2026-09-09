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
    <svg
      viewBox="0 0 36 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 2h4.3l4.6 17.7a2.4 2.4 0 0 0 2.3 1.8h16.4a2.4 2.4 0 0 0 2.3-1.8L34 7H7" />
      <circle cx="12" cy="27" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="26" cy="27" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UsFlagIcon({ className = "h-3.5 w-5" }: P) {
  return (
    <svg viewBox="0 0 20 14" className={className} aria-hidden>
      <rect width="20" height="14" rx="1.5" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="20" height="1" fill="#b22234" />
      ))}
      <rect width="9" height="7" fill="#3c3b6e" />
      <g fill="#fff">
        {[1, 3, 5].map((cy) =>
          [1, 3, 5, 7].map((cx) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.5" />
          )),
        )}
      </g>
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
