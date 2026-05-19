import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string; cutId: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id, cutId } = await params;

  const cut = await prisma.cut.findUnique({ where: { id: cutId }, include: { project: true } });
  if (!cut || cut.project.userId !== session.userId || cut.projectId !== id) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }
  if (!cut.previousImageUrl) {
    return NextResponse.json({ error: "되돌릴 이전 이미지가 없습니다." }, { status: 400 });
  }

  const updated = await prisma.cut.update({
    where: { id: cutId },
    data: {
      imageUrl: cut.previousImageUrl,
      previousImageUrl: null,
    },
  });

  return NextResponse.json({ cut: updated });
}
