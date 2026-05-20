import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(1).max(40).optional(),
  descriptionPrompt: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const preset = await prisma.presetCharacter.findUnique({ where: { id }, select: { id: true } });
  if (!preset) return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });

  const updated = await prisma.presetCharacter.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.descriptionPrompt !== undefined ? { descriptionPrompt: parsed.data.descriptionPrompt } : {}),
    },
  });
  return NextResponse.json({ preset: updated });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const preset = await prisma.presetCharacter.findUnique({ where: { id }, select: { id: true } });
  if (!preset) return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });

  await prisma.presetCharacter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
