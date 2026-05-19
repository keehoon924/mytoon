import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, creditBalance: true, role: true },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">MyToon</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {user?.role === "ADMIN" ? (
            <span className="font-medium text-purple-600">관리자 (무제한)</span>
          ) : (
            <span>크레딧 <strong className="text-black">{user?.creditBalance ?? 0}</strong>개</span>
          )}
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-gray-400 hover:text-gray-700">로그아웃</button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">내 서랍</h1>
        <p className="mt-4 text-gray-500">준비 중입니다. 곧 작품을 만들 수 있어요!</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
