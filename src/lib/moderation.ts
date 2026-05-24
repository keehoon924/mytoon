import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export type ModerationResult = {
  flagged: boolean;
  categories: string[];
};

/**
 * 텍스트 모더레이션 (OpenAI Moderation API)
 * OPENAI_API_KEY 없을 시 항상 통과
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  if (!openai) return { flagged: false, categories: [] };

  try {
    const res = await openai.moderations.create({ input: text });
    const result = res.results[0];
    if (!result) return { flagged: false, categories: [] };

    const flaggedCategories = Object.entries(result.categories)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return {
      flagged: result.flagged,
      categories: flaggedCategories,
    };
  } catch (err) {
    console.error("moderation error:", err);
    // 모더레이션 API 오류 시 통과 처리 (서비스 중단 방지)
    return { flagged: false, categories: [] };
  }
}

export function getModerationMessage(categories: string[]): string {
  const map: Record<string, string> = {
    sexual: "성적 콘텐츠",
    "sexual/minors": "미성년자 관련 성적 콘텐츠",
    violence: "폭력적 콘텐츠",
    "violence/graphic": "극단적 폭력 콘텐츠",
    harassment: "괴롭힘",
    "harassment/threatening": "위협적 콘텐츠",
    hate: "혐오 표현",
    "hate/threatening": "위협적 혐오 표현",
    "self-harm": "자해 관련 콘텐츠",
    "self-harm/intent": "자해 의도 콘텐츠",
    "self-harm/instructions": "자해 방법 안내",
    illicit: "불법 콘텐츠",
    "illicit/violent": "불법 폭력 콘텐츠",
  };

  const labels = categories.map((c) => map[c] ?? c).join(", ");
  return `부적절한 콘텐츠가 감지되었습니다: ${labels}. 다른 내용으로 다시 시도해 주세요.`;
}
