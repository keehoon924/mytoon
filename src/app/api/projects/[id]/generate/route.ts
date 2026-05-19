import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScenario, generateCutImage } from "@/lib/openai";
import { checkAndDeductCredits } from "@/lib/credits";

const schema = z.object({
  story: z.string().min(1),
  characterIds: z.array(z.string()).optional().default([]),
  mode: z.enum(["auto", "manual"]).default("auto"),
  manualScenarios: z
    .array(z.object({ description: z.string(), dialogue: z.string() }))
    .optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== session.userId) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { story, characterIds, mode, manualScenarios } = parsed.data;
  const cutCount = project.cutCount;

  // 크레딧 체크
  const credit = await checkAndDeductCredits(session.userId, session.role, cutCount);
  if (!credit.ok) {
    return NextResponse.json(
      { error: `크레딧이 부족합니다. 현재 잔액: ${credit.balance}개 (필요: ${cutCount}개)` },
      { status: 402 }
    );
  }

  // 상태 업데이트
  await prisma.project.update({ where: { id }, data: { status: "generating" } });

  try {
    // 시나리오 생성
    const scenarios =
      mode === "manual" && manualScenarios?.length
        ? manualScenarios
        : await generateScenario(story, cutCount);

    // 캐릭터 프롬프트 조회
    const characters =
      characterIds.length > 0
        ? await prisma.character.findMany({
            where: { id: { in: characterIds }, userId: session.userId },
            select: { name: true, descriptionPrompt: true },
          })
        : [];
    const characterPrompts = characters.map(
      (c) => c.descriptionPrompt ?? c.name
    );

    // 컷 이미지 병렬 생성
    const imageUrls = await Promise.all(
      scenarios.map((s) => generateCutImage(s.description, characterPrompts))
    );

    // 기존 컷 삭제 후 재생성
    await prisma.cut.deleteMany({ where: { projectId: id } });

    const cuts = await Promise.all(
      scenarios.map((s, i) =>
        prisma.cut.create({
          data: {
            projectId: id,
            orderIndex: i,
            imageUrl: imageUrls[i],
            prompt: s.description,
            characterIds,
            bubbles: s.dialogue
              ? {
                  create: {
                    type: "speech",
                    text: s.dialogue,
                    x: 10,
                    y: 10,
                    w: 220,
                    h: 60,
                  },
                }
              : undefined,
          },
          include: { bubbles: true },
        })
      )
    );

    await prisma.project.update({ where: { id }, data: { status: "done" } });

    return NextResponse.json({ project: { ...project, status: "done", cuts } });
  } catch (err) {
    await prisma.project.update({ where: { id }, data: { status: "error" } });
    console.error("generate error:", err);
    return NextResponse.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
