import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1).max(60),
  parentId: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const folders = await prisma.folder.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ folders });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { name, parentId } = parsed.data;

  if (parentId) {
    const parent = await prisma.folder.findUnique({ where: { id: parentId } });
    if (!parent || parent.userId !== session.userId) {
      return NextResponse.json({ error: "상위 폴더를 찾을 수 없습니다." }, { status: 404 });
    }
  }

  const folder = await prisma.folder.create({
    data: { userId: session.userId, name, parentId: parentId ?? null },
  });
  return NextResponse.json({ folder }, { status: 201 });
}
