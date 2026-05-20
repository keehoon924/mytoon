import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  if (!session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-black text-sm">← 내 서랍</Link>
          <span className="font-bold text-purple-600">MyToon 어드민</span>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="text-sm text-gray-400 hover:text-gray-700">로그아웃</button>
        </form>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-6 flex gap-6">
        <aside className="w-44 shrink-0">
          <nav className="flex flex-col gap-1 text-sm">
            <Link href="/admin" className="rounded px-3 py-2 hover:bg-white">통계</Link>
            <Link href="/admin/users" className="rounded px-3 py-2 hover:bg-white">사용자</Link>
            <Link href="/admin/projects" className="rounded px-3 py-2 hover:bg-white">작품</Link>
            <Link href="/admin/presets" className="rounded px-3 py-2 hover:bg-white">프리셋 캐릭터</Link>
            <Link href="/admin/reports" className="rounded px-3 py-2 hover:bg-white">신고 큐</Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
