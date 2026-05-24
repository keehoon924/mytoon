"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReportModal from "@/components/ReportModal";

type Bubble = {
  id: string;
  type: string;
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
};
type Cut = {
  id: string;
  orderIndex: number;
  imageUrl: string | null;
  prompt: string | null;
  bubbles: Bubble[];
};
type Project = {
  id: string;
  title: string;
  cutCount: number;
  layoutType: string;
  status: string;
  cuts: Cut[];
};

const LAYOUT_COLS: Record<string, number> = {
  "2x2": 2,
  "2x3": 2,
  "1x4": 1,
  "2x4": 2,
  "2x5": 2,
  grid: 2,
  vertical: 2,
  bubble: 2,
  note: 2,
};

const STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  generating: "생성 중",
  done: "완료",
  error: "오류",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500",
  generating: "bg-amber-100 text-amber-600",
  done: "bg-[#E8F0EB] text-[#7CAF8A]",
  error: "bg-red-100 text-red-500",
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (cancelled) return;
      if (res.ok) setProject(data.project);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // 생성 중일 때 폴링
  useEffect(() => {
    if (!project || project.status !== "generating") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (res.ok && data.project) {
        setProject(data.project);
        if (data.project.status !== "generating") clearInterval(timer);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [id, project?.status]);

  async function handleRegenerate() {
    if (!project) return;
    if (!confirm("전체 컷을 다시 생성하시겠습니까? 크레딧이 차감됩니다.")) return;
    setRegenerating(true);
    const res = await fetch(`/api/projects/${id}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story: "", characterIds: [] }),
    });
    const data = await res.json();
    setRegenerating(false);
    if (res.ok) setProject(data.project);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5]">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-6 w-40 rounded-lg bg-gray-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBF5]">
        <p className="text-gray-400">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const cols = LAYOUT_COLS[project.layoutType] ?? 2;
  const gridClass = cols === 1 ? "grid-cols-1" : "grid-cols-2";
  const isGenerating = project.status === "generating";

  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      {/* 헤더 */}
      <div className="border-b border-[#E8F0EB] bg-white sticky top-0 z-10 px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full border border-[#E8F0EB] p-1.5 text-gray-500 hover:bg-[#F0F7F2] text-xs"
            >
              ←
            </Link>
            <h1 className="font-bold text-gray-900 truncate">{project.title}</h1>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_COLOR[project.status] ?? "bg-gray-100 text-gray-400"
              }`}
            >
              {STATUS_LABEL[project.status] ?? project.status}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/dashboard/projects/${id}/edit`}
              className="rounded-full border border-[#E8F0EB] px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-[#F0F7F2]"
            >
              편집
            </Link>
            <Link
              href={`/dashboard/projects/${id}/export`}
              className="rounded-full bg-[#7CAF8A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6a9e79]"
            >
              내보내기
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* 생성 중 배너 */}
        {isGenerating && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <div className="h-5 w-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-sm text-amber-700">AI가 인스타툰을 생성하고 있습니다...</p>
          </div>
        )}

        {/* 컷 그리드 */}
        <div className={`grid ${gridClass} gap-3`}>
          {isGenerating && project.cuts.length === 0
            ? // 스켈레톤
              [...Array(project.cutCount)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-gray-100 animate-pulse flex items-center justify-center"
                >
                  <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-gray-300 animate-spin" />
                </div>
              ))
            : project.cuts
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((cut) => (
                  <button
                    key={cut.id}
                    onClick={() =>
                      router.push(`/dashboard/projects/${id}/edit?cutId=${cut.id}`)
                    }
                    className="group relative aspect-square rounded-xl overflow-hidden bg-[#F5F9F6] border border-[#E8F0EB] hover:ring-2 hover:ring-[#7CAF8A] transition-all"
                  >
                    {cut.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cut.imageUrl}
                        alt={`컷 ${cut.orderIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        {cut.orderIndex + 1}
                      </div>
                    )}
                    {/* 말풍선 오버레이 */}
                    {cut.bubbles.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          left: `${b.x}px`,
                          top: `${b.y}px`,
                          width: `${b.w}px`,
                          minHeight: `${b.h}px`,
                        }}
                        className="absolute rounded-lg bg-white/90 border border-gray-300 px-2 py-1 text-xs text-gray-900 shadow-sm"
                      >
                        {b.text}
                      </div>
                    ))}
                    {/* 컷 번호 */}
                    <div className="absolute bottom-1.5 left-1.5 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white">
                      {cut.orderIndex + 1}
                    </div>
                    {/* 편집 힌트 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                      <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        클릭해서 편집
                      </span>
                    </div>
                  </button>
                ))}
        </div>

        {/* 액션 버튼들 */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/projects/${id}/edit`}
            className="flex-1 min-w-[120px] rounded-full border border-[#7CAF8A] py-2.5 text-center text-sm font-medium text-[#7CAF8A] hover:bg-[#F0F7F2]"
          >
            편집하기
          </Link>
          <Link
            href={`/dashboard/projects/${id}/export`}
            className="flex-1 min-w-[120px] rounded-full bg-[#7CAF8A] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#6a9e79]"
          >
            내보내기
          </Link>
          <button
            onClick={handleRegenerate}
            disabled={regenerating || isGenerating}
            className="flex-1 min-w-[120px] rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            {regenerating ? "재생성 중..." : "전체 재생성"}
          </button>
        </div>

        {/* 신고 버튼 */}
        <div className="mt-4 text-right">
          <button
            onClick={() => setReportOpen(true)}
            className="text-xs text-gray-300 hover:text-red-400"
          >
            신고하기
          </button>
        </div>

        {/* 컷별 시나리오 */}
        <div className="mt-8 rounded-2xl border border-[#E8F0EB] bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">컷별 시나리오</h2>
          <ol className="space-y-2">
            {project.cuts
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((cut) => (
                <li key={cut.id} className="flex gap-3 text-sm text-gray-600">
                  <span className="shrink-0 rounded-full bg-[#E8F0EB] h-5 w-5 flex items-center justify-center text-xs font-semibold text-[#7CAF8A]">
                    {cut.orderIndex + 1}
                  </span>
                  <span className="pt-0.5">{cut.prompt ?? "-"}</span>
                </li>
              ))}
          </ol>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="PROJECT"
        targetId={project.id}
        targetLabel={project.title}
      />
    </main>
  );
}
