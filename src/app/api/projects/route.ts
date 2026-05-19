import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(100),
  cutCount: z.number().int().min(1).max(20),
  layoutType: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: "desc" },
    include: { cuts: { select: { imageUrl: true }, take: 1, orderBy: { orderIndex: "asc" } } },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { title, cutCount, layoutType } = parsed.data;

  const project = await prisma.project.create({
    data: { userId: session.userId, title, cutCount, layoutType, status: "draft" },
  });

  return NextResponse.json({ project }, { status: 201 });
}
