import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  action: z.enum(["delete", "dismiss", "hold"]),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  if (report.status !== "PENDING") {
    return NextResponse.json({ error: "이미 처리된 신고" }, { status: 400 });
  }

  const { action } = parsed.data;
  const adminId = guard.session.userId;

  await prisma.$transaction(async (tx) => {
    if (action === "delete") {
      if (report.targetType === "PROJECT") {
        await tx.project.deleteMany({ where: { id: report.targetId } });
      } else {
        await tx.character.deleteMany({ where: { id: report.targetId } });
      }
      await tx.report.update({
        where: { id },
        data: { status: "RESOLVED_DELETED", resolvedById: adminId, resolvedAt: new Date() },
      });
      await tx.report.updateMany({
        where: { targetType: report.targetType, targetId: report.targetId, status: "PENDING", NOT: { id } },
        data: { status: "RESOLVED_DELETED", resolvedById: adminId, resolvedAt: new Date() },
      });
    } else if (action === "dismiss") {
      await tx.report.update({
        where: { id },
        data: { status: "RESOLVED_DISMISSED", resolvedById: adminId, resolvedAt: new Date() },
      });
    } else {
      await tx.report.update({
        where: { id },
        data: { status: "RESOLVED_HOLD", resolvedById: adminId, resolvedAt: new Date() },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
