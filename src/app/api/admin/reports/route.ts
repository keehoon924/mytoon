import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const status = req.nextUrl.searchParams.get("status") ?? "PENDING";
  const whereStatus =
    status === "ALL"
      ? undefined
      : (["PENDING", "RESOLVED_DELETED", "RESOLVED_DISMISSED", "RESOLVED_HOLD"] as const).includes(
          status as "PENDING",
        )
        ? (status as "PENDING")
        : undefined;

  const reports = await prisma.report.findMany({
    where: whereStatus ? { status: whereStatus } : undefined,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      reporter: { select: { id: true, email: true } },
      resolvedBy: { select: { id: true, email: true } },
    },
  });

  return NextResponse.json({ reports });
}
