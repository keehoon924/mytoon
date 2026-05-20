import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TOSS_CONFIRM_URL, tossAuthHeader } from "@/lib/toss";
import { markOrderPaid } from "@/lib/paymentSettle";

const schema = z.object({
  paymentKey: z.string(),
  orderId: z.string(),
  amount: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값 오류" }, { status: 400 });

  const { paymentKey, orderId, amount } = parsed.data;

  const order = await prisma.paymentOrder.findUnique({ where: { tossOrderId: orderId } });
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
  }
  if (order.amountKrw !== amount) {
    return NextResponse.json({ error: "결제 금액 불일치" }, { status: 400 });
  }

  if (order.status !== "PAID") {
    const res = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: tossAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "결제 승인 실패" }));
      await prisma.paymentOrder.updateMany({
        where: { tossOrderId: orderId, status: "PENDING" },
        data: { status: "FAILED", failReason: err.message ?? "confirm failed" },
      });
      return NextResponse.json({ error: err.message ?? "결제 승인 실패" }, { status: 400 });
    }
  }

  const settled = await markOrderPaid(orderId, paymentKey, amount);
  if (!settled.ok) {
    return NextResponse.json({ error: settled.error }, { status: settled.status });
  }
  return NextResponse.json({ ok: true, credits: settled.credits, alreadyPaid: settled.alreadyPaid });
}
