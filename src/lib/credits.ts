import { prisma } from "@/lib/prisma";

export async function checkAndDeductCredits(
  userId: string,
  role: string,
  amount: number
): Promise<{ ok: boolean; balance?: number }> {
  if (role === "ADMIN") return { ok: true };

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true },
      });
      if (!user || user.creditBalance < amount) {
        throw Object.assign(new Error("insufficient"), { balance: user?.creditBalance ?? 0 });
      }
      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { decrement: amount } },
      });
      await tx.creditTransaction.create({
        data: { userId, delta: -amount, reason: "GENERATION" },
      });
    });
    return { ok: true };
  } catch (err) {
    const balance = (err as { balance?: number }).balance;
    return { ok: false, balance: balance ?? 0 };
  }
}

/**
 * 크레딧 환불 (생성 실패 시 자동 환불)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  _reason: "REFUND_GENERATION_FAILURE" | "ADMIN" = "REFUND_GENERATION_FAILURE"
): Promise<void> {
  if (amount <= 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        userId,
        delta: amount,
        reason: "REFUND",
      },
    });
  });
}
