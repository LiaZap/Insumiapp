/**
 * Logomark Insumia — cápsula de medicamento em tile de marca.
 * Alto contraste para destacar em fundos navy (login e sidebar).
 */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ins-tile" x1="6" y1="2" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4C82CC" />
          <stop offset="0.55" stopColor="#2C5DA0" />
          <stop offset="1" stopColor="#15356B" />
        </linearGradient>
        <linearGradient id="ins-cap" x1="12" y1="14" x2="30" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8EEBFF" />
          <stop offset="1" stopColor="#2FBEE6" />
        </linearGradient>
        <filter id="ins-cap-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" floodColor="#0A2247" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Tile de marca */}
      <rect width="48" height="48" rx="13" fill="url(#ins-tile)" />
      {/* Brilho de topo + contorno fino para definir a borda */}
      <path d="M13 0h22a13 13 0 0 1 0 0v9a0 0 0 0 1 0 0H13Z" fill="#FFFFFF" fillOpacity="0.10" />
      <rect x="0.6" y="0.6" width="46.8" height="46.8" rx="12.4" stroke="#FFFFFF" strokeOpacity="0.16" />

      {/* Cápsula */}
      <g transform="rotate(-45 24 24)" filter="url(#ins-cap-shadow)">
        {/* corpo branco */}
        <rect x="9.5" y="18" width="29" height="12" rx="6" fill="#FFFFFF" />
        {/* metade cyan (lado esquerdo, cantos arredondados) */}
        <path d="M15.5 18H24v12h-8.5a6 6 0 0 1 0-12Z" fill="url(#ins-cap)" />
        {/* divisória */}
        <rect x="23.3" y="18" width="1.4" height="12" fill="#15356B" fillOpacity="0.22" />
        {/* reflexo */}
        <rect x="13" y="20.3" width="8" height="2.4" rx="1.2" fill="#FFFFFF" fillOpacity="0.6" />
      </g>
    </svg>
  );
}
