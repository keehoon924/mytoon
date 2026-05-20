import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findPackage } from "@/lib/creditPackages";

const schema = z.object({
  packageId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const pkg = findPackage(parsed.data.packageId);
  if (!pkg) return NextResponse.json({ error: "패키지를 찾을 수 없습니다." }, { status: 404 });

  const tossOrderId = `mytoon_${nanoid(16)}`;

  const order = await prisma.paymentOrder.create({
    data: {
      userId: session.userId,
      packageId: pkg.id,
      credits: pkg.credits,
      amountKrw: pkg.amountKrw,
      tossOrderId,
    },
  });

  return NextResponse.json({
    order: {
      id: order.id,
      tossOrderId: order.tossOrderId,
      amountKrw: order.amountKrw,
      credits: order.credits,
      orderName: pkg.label,
    },
  }, { status: 201 });
}
