import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const orders = await prisma.paymentOrder.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true, packageId: true, credits: true, amountKrw: true,
      status: true, createdAt: true,
    },
  });
  return NextResponse.json({ orders });
}
