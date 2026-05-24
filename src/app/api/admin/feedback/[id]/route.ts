import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["OPEN", "DONE"]),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const result = await requireAdminFromRequest(req);
  if (!result.ok) return result.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const feedback = await prisma.feedback.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ feedback });
}
