import { prisma } from "@/lib/prisma";

export async function markOrderPaid(tossOrderId: string, paymentKey: string, paidAmount: number): Promise<
  | { ok: true; alreadyPaid: boolean; credits: number; userId: string }
  | { ok: false; status: number; error: string }
> {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({ where: { tossOrderId } });
    if (!order) return { ok: false, status: 404, error: "주문을 찾을 수 없습니다." };
    if (order.amountKrw !== paidAmount) return { ok: false, status: 400, error: "결제 금액 불일치" };

    if (order.status === "PAID") {
      return { ok: true, alreadyPaid: true, credits: order.credits, userId: order.userId };
    }
    if (order.status === "FAILED" || order.status === "CANCELED") {
      return { ok: false, status: 400, error: "이미 종료된 주문" };
    }

    await tx.paymentOrder.update({
      where: { id: order.id },
      data: { status: "PAID", tossPaymentKey: paymentKey },
    });
    await tx.user.update({
      where: { id: order.userId },
      data: { creditBalance: { increment: order.credits } },
    });
    await tx.creditTransaction.create({
      data: { userId: order.userId, delta: order.credits, reason: "PURCHASE" },
    });

    return { ok: true, alreadyPaid: false, credits: order.credits, userId: order.userId };
  });
}

export async function markOrderFailed(tossOrderId: string, reason: string) {
  await prisma.paymentOrder.updateMany({
    where: { tossOrderId, status: "PENDING" },
    data: { status: "FAILED", failReason: reason },
  });
}

export async function markOrderCanceled(tossOrderId: string) {
  await prisma.paymentOrder.updateMany({
    where: { tossOrderId, status: "PENDING" },
    data: { status: "CANCELED" },
  });
}
