import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCharacterFromText, generateCharacterFromPhoto } from "@/lib/openai";
import { uploadFile, getPublicUrl } from "@/lib/storage";

const textSchema = z.object({
  name: z.string().min(1).max(30),
  sourceType: z.literal("TEXT"),
  descriptionPrompt: z.string().min(1),
});

const photoSchema = z.object({
  name: z.string().min(1).max(30),
  sourceType: z.literal("PHOTO"),
  imageBase64: z.string().min(1),
});

const presetSchema = z.object({
  name: z.string().min(1).max(30),
  sourceType: z.literal("PRESET"),
  presetId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const characters = await prisma.character.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ characters });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.sourceType) {
    return NextResponse.json({ error: "sourceType이 필요합니다." }, { status: 400 });
  }

  let referenceImageUrl: string | undefined;
  let descriptionPrompt: string | undefined;
  let name: string;
  let sourceType: "PHOTO" | "TEXT" | "PRESET";

  if (body.sourceType === "TEXT") {
    const parsed = textSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });
    name = parsed.data.name;
    sourceType = "TEXT";
    descriptionPrompt = parsed.data.descriptionPrompt;
    referenceImageUrl = await generateCharacterFromText(descriptionPrompt);

  } else if (body.sourceType === "PHOTO") {
    const parsed = photoSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });
    name = parsed.data.name;
    sourceType = "PHOTO";
    const generatedUrl = await generateCharacterFromPhoto(parsed.data.imageBase64);

    // data URL이면 S3에 업로드
    if (generatedUrl.startsWith("data:")) {
      const base64Data = generatedUrl.split(",")[1];
      const key = `characters/${session.userId}/${Date.now()}.png`;
      await uploadFile(key, Buffer.from(base64Data, "base64"), "image/png");
      referenceImageUrl = getPublicUrl(key);
    } else {
      referenceImageUrl = generatedUrl;
    }

  } else if (body.sourceType === "PRESET") {
    const parsed = presetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });
    name = parsed.data.name;
    sourceType = "PRESET";
    const preset = await prisma.presetCharacter.findUnique({ where: { id: parsed.data.presetId } });
    if (!preset) return NextResponse.json({ error: "프리셋을 찾을 수 없습니다." }, { status: 404 });
    referenceImageUrl = preset.referenceImageUrl;
    descriptionPrompt = preset.descriptionPrompt ?? undefined;

  } else {
    return NextResponse.json({ error: "올바르지 않은 sourceType입니다." }, { status: 400 });
  }

  const character = await prisma.character.create({
    data: { userId: session.userId, name, sourceType, referenceImageUrl, descriptionPrompt },
  });

  return NextResponse.json({ character }, { status: 201 });
}
