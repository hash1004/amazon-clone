/**
 * A friendly sitting dog — stand-in for Amazon's "Dogs of Amazon" 404 photo.
 * `seed` lightly varies the coat so different pages show a different pup.
 */
export function SorryDog({
  className = "h-56 w-56",
  seed = 0,
}: {
  className?: string;
  seed?: number;
}) {
  const coats = [
    { body: "#c88f5a", patch: "#8a5a33", ear: "#7a4a28" },
    { body: "#9c9c9c", patch: "#5f5f5f", ear: "#4d4d4d" },
    { body: "#e0c9a6", patch: "#b58f63", ear: "#a67c4e" },
    { body: "#3f3f3f", patch: "#2a2a2a", ear: "#222" },
  ];
  const c = coats[Math.abs(seed) % coats.length];

  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label="A dog">
      <ellipse cx="120" cy="214" rx="70" ry="14" fill="#0f1111" opacity="0.08" />
      {/* back leg */}
      <path d="M78 196c-14 0-24-6-24-20 0-16 14-26 30-24l4 44z" fill={c.body} />
      {/* tail */}
      <path
        d="M168 150c22-6 34 8 30 24-3 12-16 16-26 8"
        fill="none"
        stroke={c.body}
        strokeWidth="18"
        strokeLinecap="round"
      />
      {/* body */}
      <path
        d="M70 200c-8-46 4-92 50-92s58 46 50 92c-4 22-30 26-50 26s-46-4-50-26z"
        fill={c.body}
      />
      {/* chest patch */}
      <path d="M120 128c14 0 22 20 20 44-3 20-37 20-40 0-2-24 6-44 20-44z" fill="#f4ede2" />
      {/* front paws */}
      <ellipse cx="102" cy="222" rx="13" ry="9" fill="#f4ede2" />
      <ellipse cx="140" cy="222" rx="13" ry="9" fill="#f4ede2" />
      {/* head */}
      <circle cx="120" cy="92" r="46" fill={c.body} />
      {/* ears */}
      <path d="M74 74c-16 4-22 40-8 62 12-4 20-20 22-40z" fill={c.ear} />
      <path d="M166 74c16 4 22 40 8 62-12-4-20-20-22-40z" fill={c.ear} />
      {/* eye patch */}
      <ellipse cx="103" cy="86" rx="18" ry="20" fill={c.patch} opacity="0.55" />
      {/* muzzle */}
      <ellipse cx="120" cy="108" rx="26" ry="20" fill="#f4ede2" />
      {/* eyes */}
      <circle cx="104" cy="88" r="5.5" fill="#1c1917" />
      <circle cx="136" cy="88" r="5.5" fill="#1c1917" />
      <circle cx="106" cy="86" r="1.8" fill="#fff" />
      <circle cx="138" cy="86" r="1.8" fill="#fff" />
      {/* nose + mouth */}
      <ellipse cx="120" cy="104" rx="7" ry="5" fill="#1c1917" />
      <path
        d="M120 109c0 8-8 10-14 6M120 109c0 8 8 10 14 6"
        fill="none"
        stroke="#1c1917"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* collar + tag */}
      <path d="M92 120c16 12 40 12 56 0" fill="none" stroke="#c7511f" strokeWidth="7" strokeLinecap="round" />
      <circle cx="120" cy="132" r="6" fill="#febd69" stroke="#c7511f" strokeWidth="2" />
    </svg>
  );
}
