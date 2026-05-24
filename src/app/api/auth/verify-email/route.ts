import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
  }

  const emailToken = await prisma.emailToken.findUnique({ where: { token } });
  if (!emailToken || emailToken.type !== "verify" || emailToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "유효하지 않거나 만료된 토큰입니다." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: emailToken.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ ok: true });
}
