import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const PLACEHOLDER = "https://placehold.co/512x512/e2e8f0/64748b?text=Character";

export async function generateCharacterFromText(prompt: string): Promise<string> {
  if (!openai) return PLACEHOLDER;
  const res = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Cartoon character illustration for a webtoon. ${prompt}. Simple, clean style, white background, full body view.`,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });
  return res.data?.[0]?.url ?? PLACEHOLDER;
}

export async function generateCharacterFromPhoto(imageBase64: string): Promise<string> {
  if (!openai) return PLACEHOLDER;
  // gpt-image-1 supports image editing with a reference
  const imageBuffer = Buffer.from(imageBase64, "base64");
  const file = new File([imageBuffer], "reference.png", { type: "image/png" });
  const res = await openai.images.edit({
    model: "gpt-image-1",
    image: file,
    prompt:
      "Convert this photo into a cartoon webtoon character. Keep the facial features and style similar. Simple, clean illustration, white background.",
    n: 1,
    size: "1024x1024",
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) return PLACEHOLDER;
  return `data:image/png;base64,${b64}`;
}
