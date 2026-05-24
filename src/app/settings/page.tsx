import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsView from "./SettingsView";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      creditBalance: true,
      role: true,
      emailVerifiedAt: true,
      createdAt: true,
      creditTransactions: {
        select: { id: true, delta: true, reason: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      reportsFiled: {
        select: {
          id: true,
          targetType: true,
          targetId: true,
          reason: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      feedbacks: {
        select: {
          id: true,
          category: true,
          message: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <SettingsView
      email={user.email}
      creditBalance={user.creditBalance}
      isAdmin={user.role === "ADMIN"}
      emailVerified={!!user.emailVerifiedAt}
      joinedAt={user.createdAt.toISOString()}
      creditHistory={user.creditTransactions.map((t) => ({
        id: t.id,
        delta: t.delta,
        reason: t.reason,
        createdAt: t.createdAt.toISOString(),
      }))}
      myReports={user.reportsFiled.map((r) => ({
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }))}
      myFeedbacks={user.feedbacks.map((f) => ({
        id: f.id,
        category: f.category,
        message: f.message,
        status: f.status,
        createdAt: f.createdAt.toISOString(),
      }))}
    />
  );
}
