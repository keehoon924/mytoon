import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inpaintCutImage } from "@/lib/openai";
import { checkAndDeductCredits } from "@/lib/credits";

const schema = z.object({
  prompt: z.string().min(1),
});

type RouteParams = { params: Promise<{ id: string; cutId: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id, cutId } = await params;

  const cut = await prisma.cut.findUnique({ where: { id: cutId }, include: { project: true } });
  if (!cut || cut.project.userId !== session.userId || cut.projectId !== id) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }
  if (!cut.imageUrl) {
    return NextResponse.json({ error: "재생성된 이미지가 없습니다." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "프롬프트를 입력하세요." }, { status: 400 });

  const credit = await checkAndDeductCredits(session.userId, session.role, 1);
  if (!credit.ok) {
    return NextResponse.json(
      { error: `크레딧이 부족합니다. 현재 잔액: ${credit.balance}개` },
      { status: 402 }
    );
  }

  const newImageUrl = await inpaintCutImage(cut.imageUrl, parsed.data.prompt);

  const updated = await prisma.cut.update({
    where: { id: cutId },
    data: {
      imageUrl: newImageUrl,
      previousImageUrl: cut.imageUrl,
    },
  });

  return NextResponse.json({ cut: updated });
}
