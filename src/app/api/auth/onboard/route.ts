import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reset = body?.reset === true;

  await prisma.user.update({
    where: { id: session.userId },
    data: { onboardedAt: reset ? null : new Date() },
  });

  return NextResponse.json({ ok: true });
}
