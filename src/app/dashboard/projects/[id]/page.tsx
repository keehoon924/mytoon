"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Bubble = { id: string; type: string; text: string; x: number; y: number; w: number; h: number };
type Cut = { id: string; orderIndex: number; imageUrl: string | null; prompt: string | null; bubbles: Bubble[] };
type Project = {
  id: string;
  title: string;
  cutCount: number;
  layoutType: string;
  status: string;
  cuts: Cut[];
};

const LAYOUT_COLS: Record<string, number> = {
  "2x2": 2, "2x3": 2, "1x4": 1, "2x4": 2, "2x5": 2,
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (cancelled) return;
      if (res.ok) setProject(data.project);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const cols = LAYOUT_COLS[project.layoutType] ?? 2;
  const gridClass = cols === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-gray-500 hover:text-black">
          ← 내 서랍
        </Link>
        <h1 className="font-semibold text-gray-900 truncate max-w-xs">{project.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/projects/${id}/edit`}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            편집
          </Link>
          <button
            onClick={() => router.push(`/dashboard/projects/${id}/export`)}
            className="rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white"
          >
            내보내기
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {project.status === "generating" && (
          <p className="text-center text-sm text-gray-400 mb-6">생성 중입니다...</p>
        )}

        {/* 컷 그리드 */}
        <div className={`grid ${gridClass} gap-2`}>
          {project.cuts.map((cut) => (
            <div key={cut.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {cut.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cut.imageUrl} alt={`컷 ${cut.orderIndex + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300 text-sm">
                  컷 {cut.orderIndex + 1}
                </div>
              )}
              {/* 말풍선 오버레이 */}
              {cut.bubbles.map((b) => (
                <div
                  key={b.id}
                  style={{ left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, minHeight: `${b.h}px` }}
                  className="absolute rounded-lg bg-white/90 border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm"
                >
                  {b.text}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 프롬프트 목록 */}
        <div className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">컷별 시나리오</h2>
          <ol className="flex flex-col gap-2">
            {project.cuts.map((cut) => (
              <li key={cut.id} className="flex gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-900 shrink-0">{cut.orderIndex + 1}.</span>
                <span>{cut.prompt ?? "-"}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
