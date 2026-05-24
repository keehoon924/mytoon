type StepKey = "welcome" | "character" | "generate" | "export";

const illustrations: Record<StepKey, React.ReactNode> = {
  welcome: (
    <>
      {/* Welcome: MyToon logo surrounded by comic panels */}
      <circle cx="100" cy="90" r="45" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="2" />
      <text x="100" y="78" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7CAF8A" fontFamily="sans-serif">My</text>
      <text x="100" y="95" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7CAF8A" fontFamily="sans-serif">Toon</text>
      {/* Orbiting panels */}
      <rect x="15" y="30" width="35" height="28" rx="5" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="1.5" />
      <circle cx="32" cy="42" r="7" fill="#FFDDB4" />
      <rect x="150" y="30" width="35" height="28" rx="5" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="1.5" />
      <circle cx="167" cy="42" r="7" fill="#C8E6D4" />
      <rect x="15" y="115" width="35" height="28" rx="5" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="1.5" />
      <circle cx="32" cy="127" r="7" fill="#FFD0A8" />
      <rect x="150" y="115" width="35" height="28" rx="5" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="1.5" />
      <circle cx="167" cy="127" r="7" fill="#FFDDB4" />
      {/* Sparkles */}
      <text x="60" y="25" fontSize="14" fill="#FFD700">✨</text>
      <text x="125" y="160" fontSize="12" fill="#7CAF8A">✦</text>
    </>
  ),
  character: (
    <>
      {/* Character creation: 3 character options */}
      {/* Photo option */}
      <rect x="10" y="30" width="52" height="120" rx="10" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="1.5" />
      <circle cx="36" cy="75" r="20" fill="#FFDDB4" />
      <circle cx="30" cy="70" r="3" fill="#333" />
      <circle cx="42" cy="70" r="3" fill="#333" />
      <path d="M30 82 Q36 87 42 82" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 72 Q18 57 36 55 Q54 57 56 72" fill="#5C3D2E" />
      <text x="36" y="130" textAnchor="middle" fontSize="9" fill="#7CAF8A" fontFamily="sans-serif">사진</text>

      {/* Text option */}
      <rect x="74" y="30" width="52" height="120" rx="10" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="2" />
      <circle cx="100" cy="68" r="22" fill="#C8E6D4" />
      <circle cx="94" cy="63" r="3" fill="#333" />
      <circle cx="106" cy="63" r="3" fill="#333" />
      <path d="M94 75 Q100 80 106 75" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      {/* Cat ears */}
      <path d="M80 68 L84 56 L92 66" fill="#C8E6D4" stroke="#A8D4B8" strokeWidth="1.2" />
      <path d="M108 66 L116 56 L120 68" fill="#C8E6D4" stroke="#A8D4B8" strokeWidth="1.2" />
      <text x="100" y="130" textAnchor="middle" fontSize="9" fill="#7CAF8A" fontFamily="sans-serif">텍스트</text>
      {/* "Selected" checkmark */}
      <circle cx="114" cy="44" r="9" fill="#7CAF8A" />
      <path d="M109 44 L113 48 L119 40" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Preset option */}
      <rect x="138" y="30" width="52" height="120" rx="10" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="1.5" />
      <circle cx="164" cy="75" r="20" fill="#FFD0A8" />
      <circle cx="158" cy="70" r="3" fill="#333" />
      <circle cx="170" cy="70" r="3" fill="#333" />
      <path d="M158 82 Q164 87 170 82" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M144 72 Q146 57 164 55 Q182 57 184 72" fill="#8B5E3C" />
      <text x="164" y="130" textAnchor="middle" fontSize="9" fill="#7CAF8A" fontFamily="sans-serif">프리셋</text>

      {/* Arrow pointing to middle */}
      <text x="93" y="170" textAnchor="middle" fontSize="10" fill="#7CAF8A" fontFamily="sans-serif">캐릭터를 만들어요</text>
    </>
  ),
  generate: (
    <>
      {/* AI generation: prompt → webtoon */}
      {/* Input box */}
      <rect x="10" y="20" width="180" height="40" rx="8" fill="white" stroke="#E8F0EB" strokeWidth="2" />
      <text x="25" y="37" fontSize="10" fill="#999" fontFamily="sans-serif">오늘 카페에서...</text>
      <text x="25" y="50" fontSize="10" fill="#999" fontFamily="sans-serif">☕ 일상 소재 입력</text>

      {/* Arrow */}
      <path d="M100 68 L100 85" stroke="#7CAF8A" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrow)" />
      <polygon points="93,82 100,95 107,82" fill="#7CAF8A" />

      {/* AI sparkle */}
      <circle cx="100" cy="80" r="12" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="1.5" />
      <text x="100" y="84" textAnchor="middle" fontSize="10">✨</text>

      {/* Result: mini webtoon panels */}
      <rect x="20" y="100" width="75" height="60" rx="8" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="1.5" />
      <rect x="105" y="100" width="75" height="60" rx="8" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="1.5" />
      {/* Characters in panels */}
      <circle cx="57" cy="125" r="14" fill="#FFDDB4" />
      <circle cx="53" cy="121" r="2.5" fill="#333" />
      <circle cx="61" cy="121" r="2.5" fill="#333" />
      <path d="M53 132 Q57 136 61 132" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="142" cy="125" r="14" fill="#C8E6D4" />
      <circle cx="138" cy="121" r="2.5" fill="#333" />
      <circle cx="146" cy="121" r="2.5" fill="#333" />
      <path d="M138 132 Q142 136 146 132" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      {/* Speech bubbles */}
      <rect x="28" y="148" width="35" height="10" rx="4" fill="white" stroke="#7CAF8A" strokeWidth="1" />
      <text x="45" y="156" textAnchor="middle" fontSize="6" fill="#555" fontFamily="sans-serif">어서와요!</text>
    </>
  ),
  export: (
    <>
      {/* Export: phone showing webtoon + share */}
      {/* Phone frame */}
      <rect x="55" y="10" width="90" height="150" rx="15" fill="white" stroke="#E8F0EB" strokeWidth="3" />
      <rect x="70" y="25" width="60" height="100" rx="5" fill="#FFFBF5" />
      {/* Mini panels on phone */}
      <rect x="72" y="27" width="27" height="47" rx="4" fill="#E8F0EB" />
      <rect x="101" y="27" width="27" height="47" rx="4" fill="#F0F7F2" />
      <rect x="72" y="76" width="56" height="47" rx="4" fill="#E8F0EB" />
      {/* Characters */}
      <circle cx="85" cy="48" r="10" fill="#FFDDB4" />
      <circle cx="114" cy="48" r="10" fill="#C8E6D4" />
      <circle cx="100" cy="96" r="12" fill="#FFD0A8" />
      {/* Home indicator */}
      <rect x="90" y="168" width="20" height="3" rx="1.5" fill="#E8F0EB" />

      {/* Download arrow */}
      <g transform="translate(155, 60)">
        <rect x="0" y="0" width="30" height="30" rx="8" fill="#F0F7F2" stroke="#7CAF8A" strokeWidth="1.5" />
        <path d="M15 7 L15 18" stroke="#7CAF8A" strokeWidth="2" strokeLinecap="round" />
        <polygon points="9,15 15,22 21,15" fill="#7CAF8A" />
        <line x1="9" y1="24" x2="21" y2="24" stroke="#7CAF8A" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Share icon */}
      <g transform="translate(155, 100)">
        <rect x="0" y="0" width="30" height="30" rx="8" fill="#E8F0EB" stroke="#7CAF8A" strokeWidth="1.5" />
        <circle cx="8" cy="15" r="3" fill="#7CAF8A" />
        <circle cx="22" cy="8" r="3" fill="#7CAF8A" />
        <circle cx="22" cy="22" r="3" fill="#7CAF8A" />
        <line x1="11" y1="13" x2="19" y2="10" stroke="#7CAF8A" strokeWidth="1.5" />
        <line x1="11" y1="17" x2="19" y2="20" stroke="#7CAF8A" strokeWidth="1.5" />
      </g>

      {/* Instagram logo hint */}
      <g transform="translate(10, 55)">
        <rect x="0" y="0" width="30" height="30" rx="8" fill="#E1306C" opacity="0.8" />
        <rect x="6" y="6" width="18" height="18" rx="5" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="15" cy="15" r="5" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="22" cy="8" r="1.5" fill="white" />
      </g>
    </>
  ),
};

export default function OnboardingIllustration({
  step,
  className,
}: {
  step: StepKey;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {illustrations[step]}
    </svg>
  );
}
