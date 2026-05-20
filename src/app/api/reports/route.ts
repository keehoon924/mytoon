import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  targetType: z.enum(["PROJECT", "CHARACTER"]),
  targetId: z.string().min(1),
  reason: z.enum(["SPAM", "ADULT", "VIOLENCE", "COPYRIGHT", "OTHER"]),
  detail: z.string().max(500).optional(),
});

async function targetExists(type: "PROJECT" | "CHARACTER", id: string): Promise<boolean> {
  if (type === "PROJECT") {
    const p = await prisma.project.findUnique({ where: { id }, select: { id: true } });
    return !!p;
  }
  const c = await prisma.character.findUnique({ where: { id }, select: { id: true } });
  return !!c;
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const reports = await prisma.report.findMany({
    where: { reporterId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { targetType, targetId, reason, detail } = parsed.data;

  if (!(await targetExists(targetType, targetId))) {
    return NextResponse.json({ error: "대상을 찾을 수 없습니다." }, { status: 404 });
  }

  try {
    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        targetType, targetId, reason,
        detail: detail ?? null,
      },
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "이미 신고한 대상입니다." }, { status: 409 });
    }
    throw e;
  }
}
