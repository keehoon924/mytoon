import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // 존재 여부를 노출하지 않기 위해 항상 동일한 응답
  if (user) {
    await prisma.emailToken.deleteMany({ where: { userId: user.id, type: "reset" } });
    const token = randomBytes(32).toString("hex");
    await prisma.emailToken.create({
      data: {
        userId: user.id,
        token,
        type: "reset",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({ message: "입력하신 이메일로 재설정 링크를 보냈습니다." });
}
