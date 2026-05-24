import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, emailVerifiedAt: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.emailVerifiedAt) return NextResponse.json({ error: "Already verified" }, { status: 400 });

  // 기존 인증 토큰 삭제
  await prisma.emailToken.deleteMany({
    where: { userId: session.userId, type: "VERIFY" },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.emailToken.create({
    data: {
      userId: session.userId,
      token,
      type: "VERIFY",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(user.email, token);

  return NextResponse.json({ ok: true });
}
