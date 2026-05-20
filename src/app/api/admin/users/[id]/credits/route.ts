import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  delta: z.number().int().refine((n) => n !== 0, { message: "0이 될 수 없습니다." }),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { delta } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id }, select: { creditBalance: true } });
      if (!user) throw Object.assign(new Error("not_found"), { status: 404 });
      const newBalance = user.creditBalance + delta;
      if (newBalance < 0) throw Object.assign(new Error("insufficient"), { status: 400 });
      await tx.user.update({ where: { id }, data: { creditBalance: newBalance } });
      await tx.creditTransaction.create({
        data: { userId: id, delta, reason: "ADMIN" },
      });
      return newBalance;
    });
    return NextResponse.json({ balance: updated });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    const message = (e as Error).message === "not_found" ? "사용자를 찾을 수 없습니다."
      : (e as Error).message === "insufficient" ? "잔액이 부족합니다."
      : "처리 실패";
    return NextResponse.json({ error: message }, { status });
  }
}
