import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCutImage } from "@/lib/openai";
import { checkAndDeductCredits } from "@/lib/credits";

const schema = z.object({
  prompt: z.string().optional(),
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

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const credit = await checkAndDeductCredits(session.userId, session.role, 1);
  if (!credit.ok) {
    return NextResponse.json(
      { error: `크레딧이 부족합니다. 현재 잔액: ${credit.balance}개` },
      { status: 402 }
    );
  }

  const newPrompt = parsed.data.prompt?.trim() || cut.prompt || "웹툰 만화 장면";

  const characters =
    cut.characterIds.length > 0
      ? await prisma.character.findMany({
          where: { id: { in: cut.characterIds } },
          select: { name: true, descriptionPrompt: true },
        })
      : [];
  const characterPrompts = characters.map((c) => c.descriptionPrompt ?? c.name);

  const newImageUrl = await generateCutImage(newPrompt, characterPrompts);

  const updated = await prisma.cut.update({
    where: { id: cutId },
    data: {
      imageUrl: newImageUrl,
      previousImageUrl: cut.imageUrl ?? null,
      prompt: newPrompt,
    },
  });

  return NextResponse.json({ cut: updated });
}
