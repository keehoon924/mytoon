"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string; title: string; cutCount: number; layoutType: string;
  status: string; updatedAt: string; createdAt: string;
  user: { id: string; email: string };
  cuts: { imageUrl: string | null }[];
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = q ? `/api/admin/projects?q=${encodeURIComponent(q)}` : "/api/admin/projects";
    fetch(url).then((r) => r.json()).then((data) => {
      if (!cancelled && data.projects) setProjects(data.projects);
    });
    return () => { cancelled = true; };
  }, [tick, q]);

  async function handleDelete(p: Project) {
    if (!confirm(`"${p.title}" (${p.user.email})를 삭제하시겠습니까?`)) return;
    setBusyId(p.id);
    const res = await fetch(`/api/admin/projects/${p.id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) setProjects((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">작품</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); setTick((t) => t + 1); }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목·이메일 검색"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button type="submit" className="rounded-lg bg-black px-3 py-1.5 text-sm text-white">검색</button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-3 py-2">썸네일</th>
              <th className="px-3 py-2">제목</th>
              <th className="px-3 py-2">소유자</th>
              <th className="px-3 py-2 text-right">컷</th>
              <th className="px-3 py-2">레이아웃</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">수정일</th>
              <th className="px-3 py-2 text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const thumb = p.cuts[0]?.imageUrl;
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 w-16">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={p.title} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="px-3 py-2 truncate max-w-xs">{p.title}</td>
                  <td className="px-3 py-2 text-gray-600">{p.user.email}</td>
                  <td className="px-3 py-2 text-right">{p.cutCount}</td>
                  <td className="px-3 py-2 text-gray-500">{p.layoutType}</td>
                  <td className="px-3 py-2 text-gray-500">{p.status}</td>
                  <td className="px-3 py-2 text-gray-400">{new Date(p.updatedAt).toLocaleDateString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      disabled={busyId === p.id}
                      onClick={() => handleDelete(p)}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      {busyId === p.id ? "..." : "삭제"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-gray-400">결과 없음</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
