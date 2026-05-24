import OpenAI from "openai";
import sharp from "sharp";

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

// ── 컷 인페인팅 ──────────────────────────────────────────────

/**
 * 레거시: 마스크 없이 전체 이미지 edit
 */
export async function inpaintCutImage(imageUrl: string, prompt: string): Promise<string> {
  return inpaintCutImageWithMask(imageUrl, prompt, undefined);
}

/**
 * 마스크 기반 인페인팅 (sharp로 알파 마스크 처리)
 * maskBase64: 클라이언트에서 전송한 흑백 마스크 PNG base64
 *   - 흰색(255) = 수정할 영역
 *   - 검정(0) = 보존할 영역
 */
export async function inpaintCutImageWithMask(
  imageUrl: string,
  prompt: string,
  maskBase64?: string
): Promise<string> {
  if (!openai) return IMG_PLACEHOLDER(prompt.slice(0, 20));

  // 원본 이미지 로드
  let imgBuffer: Buffer;
  if (imageUrl.startsWith("data:")) {
    imgBuffer = Buffer.from(imageUrl.split(",")[1], "base64");
  } else {
    const imgRes = await fetch(imageUrl);
    imgBuffer = Buffer.from(await imgRes.arrayBuffer());
  }

  // 1024x1024 PNG로 정규화
  const normalizedImg = await sharp(imgBuffer)
    .resize(1024, 1024, { fit: "cover" })
    .png()
    .toBuffer();

  const imageFile = new File([normalizedImg], "image.png", { type: "image/png" });

  // 마스크 처리
  let maskFile: File | undefined;
  if (maskBase64) {
    try {
      const maskBuf = Buffer.from(maskBase64, "base64");
      // 마스크를 알파 채널로 변환:
      // 흰색 픽셀 → 투명 (수정할 영역), 검정 → 불투명 (보존 영역)
      const alphaMask = await sharp(maskBuf)
        .resize(1024, 1024)
        .greyscale()
        .negate() // 반전: 흰색(수정)→0, 검정(보존)→255
        .png()
        .toBuffer();

      // RGBA 이미지 생성: R=G=B=0, A=alphaMask
      const maskRgba = await sharp({
        create: {
          width: 1024,
          height: 1024,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
      })
        .composite([{ input: alphaMask, blend: "dest-in" }])
        .png()
        .toBuffer();

      maskFile = new File([maskRgba], "mask.png", { type: "image/png" });
    } catch (e) {
      console.error("mask processing error:", e);
      // 마스크 처리 실패 시 마스크 없이 진행
    }
  }

  const editParams: Parameters<typeof openai.images.edit>[0] = {
    model: "gpt-image-1",
    image: imageFile,
    prompt: `Webtoon comic panel edit. ${prompt}. Maintain Korean cartoon style.`,
    n: 1,
    size: "1024x1024",
  };

  if (maskFile) {
    editParams.mask = maskFile;
  }

  const res = await openai.images.edit(editParams);

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) return IMG_PLACEHOLDER(prompt.slice(0, 20));
  return `data:image/png;base64,${b64}`;
}

// ── 컷 이미지 생성 ─────────────────────────────────────────────

/**
 * 컷 이미지 생성.
 * - referenceImageUrls 가 있으면 gpt-image-1 images.edit (참조 이미지 기반, 캐릭터 일관성)
 * - 없으면 gpt-image-1 images.generate (텍스트 기반)
 */
export async function generateCutImage(
  description: string,
  characterPrompts: string[],
  referenceImageUrls: string[] = [],
  artStyle?: string
): Promise<string> {
  if (!openai) return IMG_PLACEHOLDER(description.slice(0, 20));

  const styleDesc = artStyle
    ? {
        감성손그림: "Warm hand-drawn illustration style, soft lines",
        심플카툰: "Simple flat cartoon style, bold outlines",
        수채화: "Watercolor illustration style, soft colors",
      }[artStyle] ?? ""
    : "";

  const charDesc =
    characterPrompts.length > 0
      ? `Characters in this scene: ${characterPrompts.join(", ")}. `
      : "";

  const prompt = `Korean webtoon comic panel. ${charDesc}${styleDesc ? styleDesc + ". " : ""}Scene: ${description}. 1:1 square, clean illustration, simple background.`;

  // 참조 이미지가 있는 경우: gpt-image-1 edit API로 캐릭터 일관성 유지
  if (referenceImageUrls.length > 0) {
    try {
      const firstRefUrl = referenceImageUrls[0];
      let imageFile: File;

      if (firstRefUrl.startsWith("data:")) {
        // base64 data URL
        const b64 = firstRefUrl.split(",")[1];
        const buf = Buffer.from(b64, "base64");
        imageFile = new File([buf], "reference.png", { type: "image/png" });
      } else {
        // 외부 URL
        const resp = await fetch(firstRefUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        imageFile = new File([buf], "reference.png", { type: "image/png" });
      }

      const res = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: `Create a new webtoon comic panel featuring the character from the reference image. ${prompt} Keep the character's appearance consistent with the reference.`,
        n: 1,
        size: "1024x1024",
      });
      const b64 = res.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
    } catch (err) {
      console.error("generateCutImage (edit) error:", err);
      // 폴백: 텍스트 기반 생성으로
    }
  }

  // 텍스트 기반 생성: gpt-image-1 generate
  const res = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });
  const b64 = res.data?.[0]?.b64_json;
  if (b64) return `data:image/png;base64,${b64}`;
  return res.data?.[0]?.url ?? IMG_PLACEHOLDER(description.slice(0, 20));
}
