export type BubbleType = "speech" | "thought" | "shout" | "narration" | "sfx";

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
  speech: "말풍선",
  thought: "생각",
  shout: "외침",
  narration: "내레이션",
  sfx: "효과음",
};

export const FONTS = [
  { id: "default", label: "기본체" },
  { id: "gothic", label: "고딕체" },
  { id: "handwriting", label: "손글씨체" },
  { id: "round", label: "둥근체" },
  { id: "bold", label: "강조체" },
];

export const FONT_FAMILY: Record<string, string> = {
  default: "sans-serif",
  gothic: "Arial, sans-serif",
  handwriting: "cursive",
  round: "Tahoma, sans-serif",
  bold: "Impact, sans-serif",
};
