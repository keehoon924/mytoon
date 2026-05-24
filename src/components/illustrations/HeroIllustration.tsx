export default function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background panels */}
      <rect x="10" y="10" width="170" height="140" rx="12" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="2" />
      <rect x="220" y="10" width="170" height="65" rx="12" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="2" />
      <rect x="220" y="85" width="170" height="65" rx="12" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="2" />
      <rect x="10" y="165" width="80" height="140" rx="12" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="2" />
      <rect x="100" y="165" width="80" height="140" rx="12" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="2" />
      <rect x="220" y="165" width="170" height="140" rx="12" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="2" />

      {/* Panel 1: Character face */}
      <circle cx="95" cy="55" r="22" fill="#FFDDB4" />
      <circle cx="88" cy="50" r="3.5" fill="#333" />
      <circle cx="102" cy="50" r="3.5" fill="#333" />
      <path d="M87 62 Q95 68 103 62" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      {/* Hair */}
      <path d="M73 50 Q75 30 95 28 Q115 30 117 50" fill="#5C3D2E" />
      <path d="M73 50 Q70 55 72 60" stroke="#5C3D2E" strokeWidth="4" strokeLinecap="round" />
      {/* Body */}
      <rect x="75" y="85" width="40" height="50" rx="8" fill="#7CAF8A" />
      <line x1="95" y1="85" x2="95" y2="135" stroke="#6A9E78" strokeWidth="1" />

      {/* Panel 1 speech bubble */}
      <rect x="118" y="35" width="55" height="28" rx="8" fill="white" stroke="#7CAF8A" strokeWidth="1.5" />
      <path d="M120 63 L115 70 L128 63" fill="white" stroke="#7CAF8A" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="145" y="55" textAnchor="middle" fontSize="9" fill="#555" fontFamily="sans-serif">오늘도</text>
      <text x="145" y="66" textAnchor="middle" fontSize="9" fill="#555" fontFamily="sans-serif">화이팅!</text>

      {/* Panel 2 (top right): Simple scene */}
      <rect x="235" y="22" width="140" height="40" rx="6" fill="#FFFBF5" />
      <circle cx="260" cy="42" r="12" fill="#FFE0A3" />
      <circle cx="256" cy="39" r="2.5" fill="#333" />
      <circle cx="264" cy="39" r="2.5" fill="#333" />
      <path d="M255 47 Q260 51 265 47" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M240 30 Q250 22 260 24 Q268 22 270 30" fill="#8B5E3C" />
      {/* Desk */}
      <rect x="280" y="30" width="85" height="32" rx="6" fill="white" stroke="#E8F0EB" strokeWidth="1.5" />
      {/* Laptop */}
      <rect x="290" y="34" width="50" height="22" rx="3" fill="#555" />
      <rect x="292" y="36" width="46" height="16" rx="2" fill="#7CAF8A" opacity="0.7" />
      <rect x="288" y="56" width="54" height="3" rx="1.5" fill="#777" />

      {/* Panel 3 (middle right) */}
      <rect x="235" y="97" width="140" height="40" rx="6" fill="#FFFBF5" />
      {/* Stars/sparkles */}
      <text x="255" y="122" fontSize="16" fill="#FFD700">✨</text>
      <text x="275" y="115" fontSize="12" fill="#7CAF8A">🎨</text>
      <text x="295" y="122" fontSize="16" fill="#FFD700">✨</text>
      {/* Text lines suggesting AI generation */}
      <rect x="315" y="102" width="50" height="5" rx="2.5" fill="#E8F0EB" />
      <rect x="315" y="112" width="40" height="5" rx="2.5" fill="#E8F0EB" />
      <rect x="315" y="122" width="45" height="5" rx="2.5" fill="#E8F0EB" />

      {/* Bottom panels: smaller characters */}
      {/* Panel 4 */}
      <circle cx="50" cy="210" r="18" fill="#FFD0A8" />
      <circle cx="44" cy="206" r="2.5" fill="#333" />
      <circle cx="56" cy="206" r="2.5" fill="#333" />
      <path d="M44 218 Q50 224 56 218" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 207 Q34 192 50 190 Q66 192 68 207" fill="#3D2B1F" />
      <rect x="32" y="230" width="36" height="40" rx="6" fill="#F97316" />

      {/* Panel 5 */}
      <circle cx="140" cy="210" r="18" fill="#C8E6D4" />
      <circle cx="134" cy="206" r="2.5" fill="#333" />
      <circle cx="146" cy="206" r="2.5" fill="#333" />
      <path d="M135 218 Q140 222 145 218" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M124" y="207" fill="none" />
      {/* Cat ears */}
      <path d="M124 200 L128 190 L136 200" fill="#C8E6D4" stroke="#A8D4B8" strokeWidth="1" />
      <path d="M144 200 L148 190 L156 200" fill="#C8E6D4" stroke="#A8D4B8" strokeWidth="1" />
      <rect x="122" y="230" width="36" height="40" rx="6" fill="#6366F1" />

      {/* Panel 6 (big right): Final webtoon */}
      <rect x="235" y="178" width="140" height="120" rx="8" fill="#FFFBF5" />
      {/* Mini comic layout */}
      <rect x="242" y="185" width="58" height="50" rx="5" fill="#E8F0EB" />
      <rect x="307" y="185" width="58" height="50" rx="5" fill="#F0F7F2" />
      <rect x="242" y="242" width="123" height="48" rx="5" fill="#E8F0EB" />
      {/* Characters in mini panels */}
      <circle cx="271" cy="208" r="12" fill="#FFDDB4" />
      <circle cx="267" cy="205" r="2" fill="#333" />
      <circle cx="275" cy="205" r="2" fill="#333" />
      <path d="M267 214 Q271 217 275 214" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="336" cy="208" r="12" fill="#C8E6D4" />
      <circle cx="332" cy="205" r="2" fill="#333" />
      <circle cx="340" cy="205" r="2" fill="#333" />
      <path d="M332 214 Q336 218 340 214" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
      {/* Speech in last panel */}
      <rect x="252" y="250" width="45" height="18" rx="5" fill="white" stroke="#7CAF8A" strokeWidth="1" />
      <text x="274" y="262" textAnchor="middle" fontSize="7" fill="#555" fontFamily="sans-serif">완성!</text>
      <rect x="305" y="250" width="45" height="18" rx="5" fill="white" stroke="#7CAF8A" strokeWidth="1" />
      <text x="327" y="262" textAnchor="middle" fontSize="7" fill="#555" fontFamily="sans-serif">대박이다</text>

      {/* AI sparkle overlay on panel 6 */}
      <text x="350" y="190" fontSize="14" fill="#FFD700">✦</text>
      <text x="240" y="195" fontSize="10" fill="#7CAF8A">✦</text>
    </svg>
  );
}
