import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken, sessionCookieOptions } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, creditBalance: 50 },
    });
    await tx.creditTransaction.create({
      data: { userId: created.id, delta: 50, reason: "SIGNUP" },
    });
    return created;
  });

  const token = randomBytes(32).toString("hex");
  await prisma.emailToken.create({
    data: {
      userId: user.id,
      token,
      type: "verify",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  await sendVerificationEmail(email, token);

  const jwt = await signToken({ userId: user.id, role: user.role });
  const res = NextResponse.json({ message: "가입 완료. 이메일을 확인해 인증을 완료하세요." }, { status: 201 });
  res.cookies.set(sessionCookieOptions(jwt));
  return res;
}
