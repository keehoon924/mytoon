import { prisma } from "@/lib/prisma";

export async function checkAndDeductCredits(
  userId: string,
  role: string,
  amount: number
): Promise<{ ok: boolean; balance?: number }> {
  if (role === "ADMIN") return { ok: true };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });
  if (!user || user.creditBalance < amount) {
    return { ok: false, balance: user?.creditBalance ?? 0 };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { creditBalance: { decrement: amount } },
    }),
    prisma.creditTransaction.create({
      data: { userId, delta: -amount, reason: "GENERATION" },
    }),
  ]);

  return { ok: true };
}
