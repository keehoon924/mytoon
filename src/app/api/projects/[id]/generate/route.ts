import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScenario, generateCutImage } from "@/lib/openai";
import { checkAndDeductCredits, refundCredits } from "@/lib/credits";

const schema = z.object({
  story: z.string().default(""),
  characterIds: z.array(z.string()).optional().default([]),
  mode: z.enum(["auto", "manual"]).default("auto"),
  manualScenarios: z
    .array(z.object({ description: z.string(), dialogue: z.string() }))
    .optional(),
  template: z.string().optional(),
  artStyle: z.string().optional(),
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

  const { story, characterIds, mode, manualScenarios, template: _template, artStyle } = parsed.data;
  const cutCount = project.cutCount;

  const credit = await checkAndDeductCredits(session.userId, session.role, cutCount);
  if (!credit.ok) {
    return NextResponse.json(
      { error: `크레딧이 부족합니다. 현재 잔액: ${credit.balance}개 (필요: ${cutCount}개)` },
      { status: 402 }
    );
  }

  await prisma.project.update({ where: { id }, data: { status: "generating" } });

  try {
    let scenarios: { description: string; dialogue: string }[];
    if (mode === "manual" && manualScenarios?.length) {
      const hasEmpty = manualScenarios.some((s) => !s.description.trim());
      const aiScenarios = hasEmpty ? await generateScenario(story || "웹툰 만화", cutCount) : null;
      scenarios = manualScenarios.map((s, i) => ({
        description: s.description.trim() || aiScenarios?.[i]?.description || `장면 ${i + 1}`,
        dialogue: s.dialogue.trim() || aiScenarios?.[i]?.dialogue || "",
      }));
    } else {
      scenarios = await generateScenario(story, cutCount);
    }

    // 캐릭터 정보 로드 (참조 이미지 포함)
    const characters =
      characterIds.length > 0
        ? await prisma.character.findMany({
            where: { id: { in: characterIds }, userId: session.userId },
            select: { name: true, descriptionPrompt: true, referenceImageUrl: true },
          })
        : [];

    const characterPrompts = characters.map((c) => c.descriptionPrompt ?? c.name);
    const referenceImageUrls = characters
      .map((c) => c.referenceImageUrl)
      .filter((u): u is string => !!u);

    // 컷별 이미지 생성 (개별 실패 처리)
    const imageResults = await Promise.allSettled(
      scenarios.map((s) =>
        generateCutImage(s.description, characterPrompts, referenceImageUrls, artStyle)
      )
    );

    const failedCount = imageResults.filter((r) => r.status === "rejected").length;

    // 실패한 컷 크레딧 환불 (ADMIN은 건너뜀)
    if (failedCount > 0 && session.role !== "ADMIN") {
      await refundCredits(session.userId, failedCount, "REFUND_GENERATION_FAILURE");
    }

    await prisma.cut.deleteMany({ where: { projectId: id } });

    const cuts = await Promise.all(
      scenarios.map((s, i) => {
        const result = imageResults[i];
        const imageUrl =
          result.status === "fulfilled"
            ? result.value
            : `https://placehold.co/1024x1024/fee2e2/ef4444?text=생성+실패`;

        return prisma.cut.create({
          data: {
            projectId: id,
            orderIndex: i,
            imageUrl,
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
        });
      })
    );

    await prisma.project.update({ where: { id }, data: { status: "done" } });

    const response: Record<string, unknown> = { project: { ...project, status: "done", cuts } };
    if (failedCount > 0) {
      response.warning = `실패한 컷 ${failedCount}개 환불됨`;
    }

    return NextResponse.json(response);
  } catch (err) {
    // 전체 실패 시 차감된 크레딧 전체 환불
    if (session.role !== "ADMIN") {
      await refundCredits(session.userId, cutCount, "REFUND_GENERATION_FAILURE");
    }
    await prisma.project.update({ where: { id }, data: { status: "error" } });
    console.error("generate error:", err);
    return NextResponse.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
