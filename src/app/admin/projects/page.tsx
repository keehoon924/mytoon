"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  title: string;
  cutCount: number;
  layoutType: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  user: { id: string; email: string };
  cuts: { imageUrl: string | null }[];
};

const STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  generating: "생성 중",
  done: "완료",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500",
  generating: "bg-amber-100 text-amber-600",
  done: "bg-emerald-100 text-emerald-600",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [inputQ, setInputQ] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const url = q ? `/api/admin/projects?q=${encodeURIComponent(q)}` : "/api/admin/projects";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.projects) setProjects(data.projects);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [q]);

  async function handleDelete(p: Project) {
    if (!confirm(`"${p.title}" (${p.user.email})를 삭제하시겠습니까?`)) return;
    setBusyId(p.id);
    const res = await fetch(`/api/admin/projects/${p.id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) setProjects((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">작품</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "불러오는 중..." : `${projects.length}개`}
          </p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setQ(inputQ.trim()); }}
          className="flex gap-2"
        >
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="제목·이메일 검색"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-48"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 text-white text-sm px-4 py-1.5 hover:bg-purple-700"
          >
            검색
          </button>
          {q && (
            <button
              type="button"
              onClick={() => { setQ(""); setInputQ(""); }}
              className="rounded-lg border border-gray-200 text-sm px-3 py-1.5 text-gray-500 hover:bg-gray-50"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">썸네일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">제목</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">소유자</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">컷</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">수정일</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map((p) => {
              const thumb = p.cuts[0]?.imageUrl;
              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 w-16">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={p.title}
                        className="w-11 h-11 rounded-lg object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-300">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900 font-medium truncate max-w-[180px]">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.layoutType}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.user.email}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{p.cutCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(p.updatedAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      disabled={busyId === p.id}
                      onClick={() => handleDelete(p)}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 hover:underline"
                    >
                      {busyId === p.id ? "..." : "삭제"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && projects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                  {q ? `"${q}" 검색 결과가 없습니다.` : "작품이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">불러오는 중...</div>
        )}
      </div>
    </div>
  );
}
