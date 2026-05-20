import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { uploadFile, getPublicUrl } from "@/lib/storage";

const schema = z.object({
  name: z.string().min(1).max(40),
  descriptionPrompt: z.string().optional(),
  imageBase64: z.string().min(1),
});

function decodeDataUrl(dataUrl: string): { buf: Buffer; ext: string; mime: string } | null {
  const m = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  return { buf: Buffer.from(m[3], "base64"), mime: m[1], ext: m[2] === "jpeg" ? "jpg" : m[2] };
}

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const presets = await prisma.presetCharacter.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ presets });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const decoded = decodeDataUrl(parsed.data.imageBase64);
  if (!decoded) return NextResponse.json({ error: "이미지 형식 오류" }, { status: 400 });

  const key = `preset-characters/${nanoid()}.${decoded.ext}`;
  await uploadFile(key, decoded.buf, decoded.mime);

  const preset = await prisma.presetCharacter.create({
    data: {
      name: parsed.data.name,
      referenceImageUrl: getPublicUrl(key),
      descriptionPrompt: parsed.data.descriptionPrompt ?? null,
    },
  });
  return NextResponse.json({ preset }, { status: 201 });
}
