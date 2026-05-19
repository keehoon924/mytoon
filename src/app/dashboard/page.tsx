import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, creditBalance: true, role: true },
    }),
    prisma.project.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
      include: {
        cuts: { select: { imageUrl: true }, take: 1, orderBy: { orderIndex: "asc" } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">MyToon</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/dashboard/characters" className="hover:text-black">
            내 캐릭터
          </Link>
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

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">내 서랍</h1>
          <Link
            href="/dashboard/new"
            className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
          >
            + 새 작품
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400">아직 작품이 없습니다.</p>
            <Link
              href="/dashboard/new"
              className="mt-4 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white"
            >
              첫 작품 만들기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {projects.map((p) => {
              const thumb = p.cuts[0]?.imageUrl;
              return (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="group rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300 text-sm">
                        {p.status === "generating" ? "생성 중..." : "미리보기 없음"}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.cutCount}컷 · {p.layoutType}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
