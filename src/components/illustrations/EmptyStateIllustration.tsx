export default function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Blank canvas */}
      <rect x="30" y="20" width="140" height="110" rx="10" fill="#F0F7F2" stroke="#E8F0EB" strokeWidth="2" />
      {/* Inner grid lines suggesting empty panels */}
      <line x1="100" y1="20" x2="100" y2="130" stroke="#E8F0EB" strokeWidth="1.5" />
      <line x1="30" y1="75" x2="170" y2="75" stroke="#E8F0EB" strokeWidth="1.5" />
      {/* Plus icon in center */}
      <circle cx="100" cy="75" r="20" fill="white" stroke="#7CAF8A" strokeWidth="2" />
      <line x1="100" y1="66" x2="100" y2="84" stroke="#7CAF8A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="91" y1="75" x2="109" y2="75" stroke="#7CAF8A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Pencil */}
      <g transform="translate(145, 100) rotate(-30)">
        <rect x="-4" y="-18" width="8" height="28" rx="2" fill="#FFD700" />
        <polygon points="-4,10 4,10 0,18" fill="#FFDDB4" />
        <rect x="-4" y="-18" width="8" height="6" rx="1" fill="#999" />
      </g>
      {/* Stars */}
      <text x="35" y="50" fontSize="12">✨</text>
      <text x="150" y="45" fontSize="10">⭐</text>
      {/* Text area below */}
      <rect x="50" y="145" width="100" height="8" rx="4" fill="#E8F0EB" />
      <rect x="65" y="160" width="70" height="6" rx="3" fill="#E8F0EB" />
    </svg>
  );
}
