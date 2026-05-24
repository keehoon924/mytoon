import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, logoutCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.delete({ where: { id: session.userId } });

  // 세션 쿠키 삭제
  const jar = await cookies();
  jar.set(logoutCookieOptions());

  return NextResponse.json({ ok: true });
}
