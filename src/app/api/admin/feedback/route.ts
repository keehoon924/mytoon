import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const result = await requireAdminFromRequest(req);
  if (!result.ok) return result.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const feedbacks = await prisma.feedback.findMany({
    where: status ? { status: status as "OPEN" | "DONE" } : undefined,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ feedbacks });
}
