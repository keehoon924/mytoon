import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  parentId: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

async function ownedFolder(folderId: string, userId: string) {
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder || folder.userId !== userId) return null;
  return folder;
}

async function wouldCreateCycle(folderId: string, newParentId: string): Promise<boolean> {
  if (folderId === newParentId) return true;
  let cursor: string | null = newParentId;
  const seen = new Set<string>();
  while (cursor) {
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    if (cursor === folderId) return true;
    const parent: { parentId: string | null } | null = await prisma.folder.findUnique({
      where: { id: cursor },
      select: { parentId: true },
    });
    cursor = parent?.parentId ?? null;
  }
  return false;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const folder = await ownedFolder(id, session.userId);
  if (!folder) return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { name, parentId } = parsed.data;

  if (parentId !== undefined && parentId !== null) {
    const parent = await ownedFolder(parentId, session.userId);
    if (!parent) return NextResponse.json({ error: "상위 폴더를 찾을 수 없습니다." }, { status: 404 });
    if (await wouldCreateCycle(id, parentId)) {
      return NextResponse.json({ error: "순환 구조를 만들 수 없습니다." }, { status: 400 });
    }
  }

  const updated = await prisma.folder.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(parentId !== undefined ? { parentId } : {}),
    },
  });
  return NextResponse.json({ folder: updated });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const folder = await ownedFolder(id, session.userId);
  if (!folder) return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });

  await prisma.folder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
