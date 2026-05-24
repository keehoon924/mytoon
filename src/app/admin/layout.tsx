import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  if (!session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <header className="border-b bg-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            내 서랍
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-purple-600 text-white text-xs font-bold">A</span>
            <span className="font-semibold text-gray-900 text-sm">MyToon 어드민</span>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            로그아웃
          </button>
        </form>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <aside className="w-52 shrink-0 border-r bg-white flex flex-col">
          <AdminNav />
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
