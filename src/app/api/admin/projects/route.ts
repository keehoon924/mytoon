import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const projects = await prisma.project.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true, title: true, cutCount: true, layoutType: true, status: true,
      updatedAt: true, createdAt: true,
      user: { select: { id: true, email: true } },
      cuts: { select: { imageUrl: true }, take: 1, orderBy: { orderIndex: "asc" } },
    },
  });
  return NextResponse.json({ projects });
}
