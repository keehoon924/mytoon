export type BubbleType =
  | "speech"
  | "speech_round"
  | "thought"
  | "shout"
  | "shout_star"
  | "narration"
  | "sfx"
  | "tail_left"
  | "tail_right"
  | "whisper"
  | "double_line";

export type BubbleObject = {
  id: string;
  kind: "bubble";
  bubbleType: BubbleType;
  text: string;
  font: string;
  color: string;
  fontSize: number;
  bold: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zIndex: number;
};

export type CharacterObject = {
  id: string;
  kind: "character";
  characterId: string;
  imageUrl: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zIndex: number;
};

export type StrokeObject = {
  id: string;
  kind: "stroke";
  points: number[];
  color: string;
  width: number;
  erase: boolean;
  zIndex: number;
};

export type CanvasObject = BubbleObject | CharacterObject | StrokeObject;

export type FilterSettings = {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  sepia: boolean;
};

export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  grayscale: false,
  sepia: false,
};

export const CANVAS_SIZE = 512;

export const BUBBLE_LABELS: Record<BubbleType, string> = {
  speech: "말풍선 (기본)",
  speech_round: "말풍선 (둥근)",
  thought: "생각 구름",
  shout: "외침 폭발",
  shout_star: "별 외침",
  narration: "내레이션",
  sfx: "효과음",
  tail_left: "꼬리 말풍선 (좌)",
  tail_right: "꼬리 말풍선 (우)",
  whisper: "속삭임",
  double_line: "이중선 박스",
};

export const BUBBLE_EMOJIS: Record<BubbleType, string> = {
  speech: "💬",
  speech_round: "🗨️",
  thought: "💭",
  shout: "💥",
  shout_star: "⭐",
  narration: "📦",
  sfx: "✨",
  tail_left: "◀",
  tail_right: "▶",
  whisper: "🤫",
  double_line: "▭",
};

export const FONTS = [
  { id: "default", label: "기본체" },
  { id: "noto-sans", label: "Noto Sans KR" },
  { id: "noto-serif", label: "Noto Serif KR" },
  { id: "black-han-sans", label: "Black Han Sans" },
  { id: "bmdohyeon", label: "BMDOHYEON" },
  { id: "jua", label: "Jua" },
  { id: "gothic", label: "고딕체" },
  { id: "handwriting", label: "손글씨체" },
];

export const FONT_FAMILY: Record<string, string> = {
  default: "'Noto Sans KR', sans-serif",
  "noto-sans": "'Noto Sans KR', sans-serif",
  "noto-serif": "'Noto Serif KR', serif",
  "black-han-sans": "'Black Han Sans', sans-serif",
  bmdohyeon: "'BMDOHYEON', sans-serif",
  jua: "'Jua', sans-serif",
  gothic: "Arial, sans-serif",
  handwriting: "cursive",
};
