import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: q ? { email: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, email: true, role: true,
      creditBalance: true, createdAt: true,
      _count: { select: { projects: true } },
    },
  });

  return NextResponse.json({ users });
}
