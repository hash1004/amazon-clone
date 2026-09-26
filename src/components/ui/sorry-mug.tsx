/** An empty mug — stand-in illustration for "nothing here" states (404, empty search). */
export function SorryMug({ className = "h-56 w-56" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label="An empty coffee mug">
      <ellipse cx="120" cy="206" rx="70" ry="12" fill="#1f1d15" opacity="0.08" />
      {/* steam */}
      <path
        d="M96 70c-8-10-8-20 2-28M120 66c-8-10-8-20 2-28M144 70c-8-10-8-20 2-28"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* handle */}
      <path
        d="M168 108c22 0 34 14 34 32s-12 32-34 32"
        fill="none"
        stroke="var(--text-accent)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* mug body */}
      <path
        d="M56 100h116l-8 68c-2 18-18 30-36 30h-28c-18 0-34-12-36-30z"
        fill="var(--bg-surface)"
        stroke="var(--border-strong)"
        strokeWidth="4"
      />
      {/* empty-mug shadow inside the rim */}
      <ellipse cx="114" cy="104" rx="54" ry="10" fill="var(--bg-subtle)" />
      {/* a couple of stray beans at the bottom, tipped over */}
      <ellipse cx="96" cy="190" rx="8" ry="5" fill="var(--text-accent)" opacity="0.6" transform="rotate(-20 96 190)" />
      <ellipse cx="112" cy="196" rx="8" ry="5" fill="var(--text-accent)" opacity="0.6" transform="rotate(15 112 196)" />
    </svg>
  );
}
