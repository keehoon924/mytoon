import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_VERSIONS = 10;

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { userId: true } });
  if (!project || project.userId !== session.userId) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const versions = await prisma.projectVersion.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });
  return NextResponse.json({ versions });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { cuts: { include: { bubbles: true }, orderBy: { orderIndex: "asc" } } },
  });
  if (!project || project.userId !== session.userId) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const snapshot = {
    title: project.title,
    cuts: project.cuts.map((c) => ({
      orderIndex: c.orderIndex,
      imageUrl: c.imageUrl,
      previousImageUrl: c.previousImageUrl,
      prompt: c.prompt,
      characterIds: c.characterIds,
      overlayJson: c.overlayJson,
      bubbles: c.bubbles.map((b) => ({
        type: b.type, text: b.text, font: b.font,
        color: b.color, fontSize: b.fontSize, bold: b.bold,
        x: b.x, y: b.y, w: b.w, h: b.h,
        rotation: b.rotation, zIndex: b.zIndex,
      })),
    })),
  };

  const created = await prisma.$transaction(async (tx) => {
    const v = await tx.projectVersion.create({
      data: { projectId: id, snapshotJson: snapshot },
    });
    const all = await tx.projectVersion.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (all.length > MAX_VERSIONS) {
      const toDelete = all.slice(MAX_VERSIONS).map((v) => v.id);
      await tx.projectVersion.deleteMany({ where: { id: { in: toDelete } } });
    }
    return v;
  });

  return NextResponse.json({ version: { id: created.id, createdAt: created.createdAt } }, { status: 201 });
}
