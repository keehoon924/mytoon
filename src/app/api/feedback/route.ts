import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitSchema = z.object({
  category: z.enum(["BUG", "REQUEST", "INQUIRY"]).default("INQUIRY"),
  message: z.string().min(5).max(2000),
});

// POST: 피드백 제출
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "올바른 내용을 입력해 주세요." }, { status: 400 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: session.userId,
      category: parsed.data.category,
      message: parsed.data.message,
    },
  });

  return NextResponse.json({ feedback }, { status: 201 });
}

// GET: 내 피드백 목록
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const feedbacks = await prisma.feedback.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ feedbacks });
}
