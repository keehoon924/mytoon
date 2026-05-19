import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const emailToken = await prisma.emailToken.findUnique({ where: { token } });
  if (!emailToken || emailToken.type !== "reset" || emailToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "유효하지 않거나 만료된 토큰입니다." }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: emailToken.userId },
      data: { passwordHash },
    }),
    prisma.emailToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ message: "비밀번호가 변경됐습니다. 다시 로그인해주세요." });
}
