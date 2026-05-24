export type ArtStyle = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  promptHint: string;
};

export const ART_STYLES: ArtStyle[] = [
  {
    id: "감성손그림",
    name: "감성 손그림",
    description: "따뜻하고 부드러운 손그림 스타일. 일상·감성 콘텐츠에 잘 어울려요.",
    emoji: "✏️",
    promptHint: "warm hand-drawn illustration, soft lines, cozy atmosphere",
  },
  {
    id: "심플카툰",
    name: "심플 카툰",
    description: "깔끔하고 명확한 카툰 스타일. 유머·정보 콘텐츠에 딱.",
    emoji: "🎨",
    promptHint: "simple flat cartoon style, bold outlines, bright colors",
  },
  {
    id: "수채화",
    name: "수채화",
    description: "부드러운 수채화 터치. 힐링·자연 테마에 완벽해요.",
    emoji: "🖌️",
    promptHint: "watercolor illustration style, soft pastel colors, dreamy",
  },
];

export function getArtStyle(id: string): ArtStyle | undefined {
  return ART_STYLES.find((s) => s.id === id);
}
