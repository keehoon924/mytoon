import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DrawerView from "./DrawerView";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, creditBalance: true, role: true },
  });

  return (
    <DrawerView
      userEmail={user?.email ?? ""}
      creditBalance={user?.creditBalance ?? 0}
      isAdmin={user?.role === "ADMIN"}
    />
  );
}
