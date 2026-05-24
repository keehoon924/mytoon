import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      creditBalance: true,
      role: true,
      emailVerifiedAt: true,
    },
  });

  return (
    <DashboardShell
      userEmail={user?.email ?? ""}
      creditBalance={user?.creditBalance ?? 0}
      isAdmin={user?.role === "ADMIN"}
      emailVerified={!!user?.emailVerifiedAt}
    >
      {children}
    </DashboardShell>
  );
}
