import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { requireAdminFromRequest } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

type DailyRow = { day: Date; count: bigint };
type DailySumRow = { day: Date; total: bigint };

function buildDailySeries(rows: { day: Date; value: number }[], days: number): { date: string; value: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = r.day.toISOString().slice(0, 10);
    map.set(key, r.value);
  }
  const out: { date: string; value: number }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, value: map.get(key) ?? 0 });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdminFromRequest(req);
  if (!guard.ok) return guard.response;

  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get("days") ?? "30"), 7), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const wauSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    wau,
    totalProjects,
    totalCuts,
    projectRows,
    cutRows,
    creditRows,
    paidSumRow,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastActiveAt: { gte: wauSince } } }),
    prisma.project.count(),
    prisma.cut.count(),
    prisma.$queryRaw<DailyRow[]>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "Project"
      WHERE "createdAt" >= ${since}
      GROUP BY day ORDER BY day
    `),
    prisma.$queryRaw<DailyRow[]>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS count
      FROM "Cut"
      WHERE "createdAt" >= ${since}
      GROUP BY day ORDER BY day
    `),
    prisma.$queryRaw<DailySumRow[]>(Prisma.sql`
      SELECT DATE_TRUNC('day', "createdAt") AS day, SUM(-"delta")::bigint AS total
      FROM "CreditTransaction"
      WHERE "reason" = 'GENERATION' AND "createdAt" >= ${since}
      GROUP BY day ORDER BY day
    `),
    prisma.paymentOrder.aggregate({
      _sum: { amountKrw: true, credits: true },
      where: { status: "PAID", createdAt: { gte: since } },
    }),
  ]);

  const projectsDaily = buildDailySeries(
    projectRows.map((r) => ({ day: r.day, value: Number(r.count) })),
    days,
  );
  const cutsDaily = buildDailySeries(
    cutRows.map((r) => ({ day: r.day, value: Number(r.count) })),
    days,
  );
  const creditsDaily = buildDailySeries(
    creditRows.map((r) => ({ day: r.day, value: Number(r.total) })),
    days,
  );

  return NextResponse.json({
    days,
    totalUsers,
    wau,
    totalProjects,
    totalCuts,
    revenueKrw: Number(paidSumRow._sum.amountKrw ?? 0),
    creditsPurchased: Number(paidSumRow._sum.credits ?? 0),
    projectsDaily,
    cutsDaily,
    creditsDaily,
  });
}
