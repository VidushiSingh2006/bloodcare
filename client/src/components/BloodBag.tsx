type Props = { label: string; fillPercent: number };

/** Original bag glyph used on the public gate — fill height tracks live stock. */
export function BloodBag({ label, fillPercent }: Props) {
  const clamped = Math.max(6, Math.min(92, fillPercent || 6));
  return (
    <svg className="bag" viewBox="0 0 160 200" aria-hidden="true">
      <path d="M64 18h32v18H64z" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
      <path d="M78 8h4v12h-4z" fill="#fff" />
      <path
        d="M40 42h80c8 0 14 6 14 14v92c0 22-18 36-40 36H66c-22 0-40-14-40-36V56c0-8 6-14 14-14z"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
      />
      <clipPath id="bagClip">
        <path d="M46 50h68c5 0 8 3 8 8v86c0 18-14 28-32 28H70c-18 0-32-10-32-28V58c0-5 3-8 8-8z" />
      </clipPath>
      <g clipPath="url(#bagClip)">
        <rect x="38" y={50 + (122 * (100 - clamped)) / 100} width="84" height="140" fill="#fff" opacity="0.95" />
      </g>
      <text x="80" y="118" textAnchor="middle" fill="#d01246" fontSize="28" fontWeight="800" fontFamily="Plus Jakarta Sans">
        {label}
      </text>
    </svg>
  );
}
