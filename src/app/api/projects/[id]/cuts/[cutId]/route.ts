import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bubbleSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  text: z.string(),
  font: z.string().default("default"),
  color: z.string().default("#000000"),
  fontSize: z.number().default(14),
  bold: z.boolean().default(false),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  rotation: z.number().default(0),
  zIndex: z.number().default(0),
});

const overlayItemSchema = z.object({
  id: z.string(),
  type: z.literal("character"),
  characterId: z.string(),
  imageUrl: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  rotation: z.number().default(0),
  zIndex: z.number().default(0),
});

const patchSchema = z.object({
  bubbles: z.array(bubbleSchema).optional(),
  overlayItems: z.array(overlayItemSchema).optional(),
});

type RouteParams = { params: Promise<{ id: string; cutId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id, cutId } = await params;

  const cut = await prisma.cut.findUnique({ where: { id: cutId }, include: { project: true } });
  if (!cut || cut.project.userId !== session.userId || cut.projectId !== id) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { bubbles, overlayItems } = parsed.data;

  // 말풍선 교체
  if (bubbles !== undefined) {
    await prisma.bubble.deleteMany({ where: { cutId } });
    if (bubbles.length > 0) {
      await prisma.bubble.createMany({
        data: bubbles.map((b) => ({
          cutId,
          type: b.type,
          text: b.text,
          font: b.font,
          x: b.x,
          y: b.y,
          w: b.w,
          h: b.h,
        })),
      });
    }
  }

  // overlay (캐릭터 스티커 등) 저장
  const updated = await prisma.cut.update({
    where: { id: cutId },
    data: {
      ...(overlayItems !== undefined ? { overlayJson: overlayItems } : {}),
    },
    include: { bubbles: true },
  });

  return NextResponse.json({ cut: updated });
}
