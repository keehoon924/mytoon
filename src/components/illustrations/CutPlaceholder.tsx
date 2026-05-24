// Color palettes for different art styles
const PALETTE: Record<string, { bg: string; accent: string; face: string }> = {
  "감성손그림": { bg: "#F0F7F2", accent: "#7CAF8A", face: "#FFDDB4" },
  "심플카툰": { bg: "#EFF6FF", accent: "#6366F1", face: "#FFD0A8" },
  "수채화": { bg: "#FEF3C7", accent: "#D97706", face: "#C8E6D4" },
};

// Different character poses/scenes per cut index
function CutScene({ index, artStyle }: { index: number; artStyle: string }) {
  const p = PALETTE[artStyle] ?? PALETTE["감성손그림"];

  switch (index % 4) {
    case 0:
      return (
        <>
          {/* Thinking character */}
          <circle cx="40" cy="38" r="16" fill={p.face} />
          <circle cx="35" cy="34" r="2.5" fill="#333" />
          <circle cx="45" cy="34" r="2.5" fill="#333" />
          <path d="M35 44 Q40 49 45 44" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M24 34 Q26 22 40 20 Q54 22 56 34" fill="#5C3D2E" />
          {/* Thought bubble */}
          <circle cx="58" cy="20" r="2" fill={p.accent} opacity="0.5" />
          <circle cx="63" cy="14" r="3" fill={p.accent} opacity="0.5" />
          <circle cx="70" cy="10" r="5" fill={p.accent} opacity="0.6" />
        </>
      );
    case 1:
      return (
        <>
          {/* Surprised character */}
          <circle cx="40" cy="38" r="16" fill={p.face} />
          <circle cx="35" cy="33" r="3.5" fill="#333" />
          <circle cx="45" cy="33" r="3.5" fill="#333" />
          <ellipse cx="40" cy="46" rx="5" ry="4" fill="#333" />
          <path d="M24 34 Q26 22 40 20 Q54 22 56 34" fill="#8B5E3C" />
          {/* Exclamation */}
          <text x="62" y="25" fontSize="18" fill={p.accent} fontWeight="bold">!</text>
        </>
      );
    case 2:
      return (
        <>
          {/* Happy character */}
          <circle cx="40" cy="35" r="16" fill={p.face} />
          <path d="M33 30 Q35 26 38 30" stroke="#333" strokeWidth="1.5" fill="none" />
          <path d="M42 30 Q45 26 47 30" stroke="#333" strokeWidth="1.5" fill="none" />
          <path d="M32 43 Q40 52 48 43" stroke="#333" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M24 31 Q26 19 40 17 Q54 19 56 31" fill="#5C3D2E" />
          {/* Hearts */}
          <text x="58" y="20" fontSize="12" fill="#F97316">♥</text>
          <text x="15" y="22" fontSize="10" fill={p.accent}>♥</text>
        </>
      );
    case 3:
    default:
      return (
        <>
          {/* Content/sleepy character */}
          <circle cx="40" cy="38" r="16" fill={p.face} />
          <path d="M33 34 Q36 31 39 34" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M41 34 Q44 31 47 34" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M34 45 Q40 50 46 45" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M24 34 Q26 22 40 20 Q54 22 56 34" fill="#3D2B1F" />
          {/* Stars */}
          <text x="60" y="18" fontSize="10" fill="#FFD700">✦</text>
          <text x="15" y="55" fontSize="8" fill={p.accent}>✦</text>
        </>
      );
  }
}

export default function CutPlaceholder({
  index,
  artStyle,
  caption,
  large = false,
}: {
  index: number;
  artStyle: string;
  caption?: string;
  large?: boolean;
}) {
  const p = PALETTE[artStyle] ?? PALETTE["감성손그림"];

  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${large ? "" : ""}`}
      aria-label={caption ?? `컷 ${index + 1}`}
    >
      <rect x="1" y="1" width="78" height="78" rx="8" fill={p.bg} />
      <CutScene index={index} artStyle={artStyle} />
      {caption && (
        <foreignObject x="5" y="60" width="70" height="18">
          <div
            style={{
              fontSize: "7px",
              color: "#666",
              textAlign: "center",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              fontFamily: "sans-serif",
            }}
          >
            {caption}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
