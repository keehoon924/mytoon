import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const snapshotSchema = z.object({
  title: z.string().optional(),
  cuts: z.array(z.object({
    orderIndex: z.number().int(),
    imageUrl: z.string().nullable(),
    previousImageUrl: z.string().nullable().optional(),
    prompt: z.string().nullable(),
    characterIds: z.array(z.string()).default([]),
    overlayJson: z.unknown().nullable().optional(),
    bubbles: z.array(z.object({
      type: z.string(),
      text: z.string(),
      font: z.string(),
      color: z.string(),
      fontSize: z.number().int(),
      bold: z.boolean(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
      rotation: z.number(),
      zIndex: z.number().int(),
    })),
  })),
});

type RouteParams = { params: Promise<{ id: string; vid: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id, vid } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { userId: true } });
  if (!project || project.userId !== session.userId) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const version = await prisma.projectVersion.findUnique({ where: { id: vid } });
  if (!version || version.projectId !== id) {
    return NextResponse.json({ error: "버전을 찾을 수 없습니다." }, { status: 404 });
  }

  const parsed = snapshotSchema.safeParse(version.snapshotJson);
  if (!parsed.success) {
    return NextResponse.json({ error: "스냅샷 형식 오류" }, { status: 500 });
  }
  const snap = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.cut.deleteMany({ where: { projectId: id } });
    for (const c of snap.cuts) {
      await tx.cut.create({
        data: {
          projectId: id,
          orderIndex: c.orderIndex,
          imageUrl: c.imageUrl,
          previousImageUrl: c.previousImageUrl ?? null,
          prompt: c.prompt,
          characterIds: c.characterIds,
          overlayJson: (c.overlayJson ?? undefined) as object | undefined,
          bubbles: { create: c.bubbles },
        },
      });
    }
    if (snap.title) {
      await tx.project.update({ where: { id }, data: { title: snap.title } });
    }
  });

  return NextResponse.json({ ok: true });
}
