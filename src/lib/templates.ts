export type Template = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cutCount: number;
  layoutType: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "basic4",
    name: "기본 4컷",
    description: "가장 많이 쓰이는 4컷 형식. 기승전결 구성.",
    emoji: "📖",
    cutCount: 4,
    layoutType: "grid",
  },
  {
    id: "vertical",
    name: "세로 스토리",
    description: "인스타그램 세로 스토리 최적화. 6컷 구성.",
    emoji: "📱",
    cutCount: 6,
    layoutType: "vertical",
  },
  {
    id: "bubble",
    name: "말풍선 강조",
    description: "대사 중심의 4컷. 말풍선이 메인.",
    emoji: "💬",
    cutCount: 4,
    layoutType: "bubble",
  },
  {
    id: "note",
    name: "노트 정리",
    description: "정보 전달용 4컷. 학습·공유 콘텐츠에 적합.",
    emoji: "📝",
    cutCount: 4,
    layoutType: "note",
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
