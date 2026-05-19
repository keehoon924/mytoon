import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const IMG_PLACEHOLDER = (text: string) =>
  `https://placehold.co/1024x1024/e2e8f0/64748b?text=${encodeURIComponent(text)}`;

// ── 캐릭터 생성 ────────────────────────────────────────────────

export async function generateCharacterFromText(prompt: string): Promise<string> {
  if (!openai) return IMG_PLACEHOLDER("Character");
  const res = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Cartoon character illustration for a webtoon. ${prompt}. Simple, clean style, white background, full body view.`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });
  return res.data?.[0]?.url ?? IMG_PLACEHOLDER("Character");
}

export async function generateCharacterFromPhoto(imageBase64: string): Promise<string> {
  if (!openai) return IMG_PLACEHOLDER("Character");
  const imageBuffer = Buffer.from(imageBase64, "base64");
  const file = new File([imageBuffer], "reference.png", { type: "image/png" });
  const res = await openai.images.edit({
    model: "gpt-image-1",
    image: file,
    prompt:
      "Convert this photo into a cartoon webtoon character. Keep facial features similar. Simple, clean illustration, white background.",
    n: 1,
    size: "1024x1024",
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) return IMG_PLACEHOLDER("Character");
  return `data:image/png;base64,${b64}`;
}

// ── 시나리오 생성 ──────────────────────────────────────────────

export type CutScenario = {
  description: string;
  dialogue: string;
};

export async function generateScenario(
  story: string,
  cutCount: number
): Promise<CutScenario[]> {
  if (!openai) {
    return Array.from({ length: cutCount }, (_, i) => ({
      description: `장면 ${i + 1}: ${story}`,
      dialogue: `대사 ${i + 1}`,
    }));
  }

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "당신은 인스타툰 작가입니다. 사용자의 줄거리를 받아 각 컷의 장면 묘사와 대사를 JSON으로 반환합니다. 반드시 {\"cuts\": [{\"description\": \"...\", \"dialogue\": \"...\"}]} 형식으로 반환하세요.",
      },
      {
        role: "user",
        content: `줄거리: ${story}\n컷 수: ${cutCount}컷\n\n${cutCount}개의 컷으로 나눠주세요.`,
      },
    ],
  });

  const content = res.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(content) as { cuts?: CutScenario[] };
  const cuts = parsed.cuts ?? [];

  // 부족하면 채우기
  while (cuts.length < cutCount) {
    cuts.push({ description: `장면 ${cuts.length + 1}`, dialogue: "" });
  }
  return cuts.slice(0, cutCount);
}

// ── 컷 이미지 생성 ─────────────────────────────────────────────

export async function generateCutImage(
  description: string,
  characterPrompts: string[]
): Promise<string> {
  if (!openai) return IMG_PLACEHOLDER(description.slice(0, 20));

  const charDesc =
    characterPrompts.length > 0
      ? `Characters: ${characterPrompts.join(", ")}. `
      : "";

  const res = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Webtoon comic panel. ${charDesc}Scene: ${description}. Korean cartoon style, 1:1 square, clean illustration, simple background.`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });
  return res.data?.[0]?.url ?? IMG_PLACEHOLDER(description.slice(0, 20));
}
