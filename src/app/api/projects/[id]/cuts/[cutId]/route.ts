import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bubbleSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  text: z.string(),
  font: z.string().default("default"),
  color: z.string().default("#111111"),
  fontSize: z.number().int().default(14),
  bold: z.boolean().default(false),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  rotation: z.number().default(0),
  zIndex: z.number().int().default(0),
});

const characterItemSchema = z.object({
  id: z.string(),
  type: z.literal("character"),
  characterId: z.string(),
  imageUrl: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  rotation: z.number().default(0),
  zIndex: z.number().int().default(0),
});

const strokeItemSchema = z.object({
  id: z.string(),
  type: z.literal("stroke"),
  points: z.array(z.number()).max(20000),
  color: z.string(),
  width: z.number().min(0.5).max(100),
  erase: z.boolean(),
  zIndex: z.number().int().default(0),
});

const overlayItemSchema = z.union([characterItemSchema, strokeItemSchema]);

const filterSchema = z.object({
  brightness: z.number().min(-1).max(1).default(0),
  contrast: z.number().min(-1).max(1).default(0),
  saturation: z.number().min(-2).max(2).default(0),
  grayscale: z.boolean().default(false),
  sepia: z.boolean().default(false),
});

const overlaySchema = z.object({
  items: z.array(overlayItemSchema).default([]),
  filters: filterSchema.optional(),
});

const patchSchema = z.object({
  bubbles: z.array(bubbleSchema).optional(),
  overlay: overlaySchema.optional(),
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

  const { bubbles, overlay } = parsed.data;

  if (bubbles !== undefined) {
    await prisma.$transaction([
      prisma.bubble.deleteMany({ where: { cutId } }),
      ...(bubbles.length > 0
        ? [prisma.bubble.createMany({
            data: bubbles.map((b) => ({
              cutId,
              type: b.type,
              text: b.text,
              font: b.font,
              color: b.color,
              fontSize: b.fontSize,
              bold: b.bold,
              x: b.x,
              y: b.y,
              w: b.w,
              h: b.h,
              rotation: b.rotation,
              zIndex: b.zIndex,
            })),
          })]
        : []),
    ]);
  }

  const updated = await prisma.cut.update({
    where: { id: cutId },
    data: {
      ...(overlay !== undefined ? { overlayJson: overlay } : {}),
    },
    include: { bubbles: true },
  });

  return NextResponse.json({ cut: updated });
}
