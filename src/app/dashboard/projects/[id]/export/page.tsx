"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import JSZip from "jszip";
import {
  renderCutToCanvas,
  canvasToBlob,
  downloadBlob,
  type ExportCut,
  type ExportOptions,
} from "@/lib/exportCut";

type Bubble = {
  id: string;
  type: string;
  text: string;
  font: string;
  color: string;
  fontSize: number;
  bold: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  zIndex: number;
};

type RawCut = {
  id: string;
  orderIndex: number;
  imageUrl: string | null;
  bubbles: Bubble[];
  overlayJson: ExportCut["overlay"] | null;
};

type Project = { id: string; title: string; cuts: RawCut[] };

const SIZE_OPTIONS = [1080, 1440, 2160] as const;

function rawToExportCut(c: RawCut): ExportCut {
  return {
    imageUrl: c.imageUrl,
    bubbles: c.bubbles,
    overlay: c.overlayJson,
  };
}

function sanitize(name: string) {
  return name.replace(/[^\w가-힣ㄱ-ㅎㅏ-ㅣ.-]+/g, "_").slice(0, 40) || "project";
}

export default function ExportPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [size, setSize] = useState<number>(1080);
  const [square, setSquare] = useState(true); // 1:1 정사각
  const [watermark, setWatermark] = useState(false);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("grid");
  const [carouselIdx, setCarouselIdx] = useState(0);

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [zipStatus, setZipStatus] = useState<"idle" | "zipping" | "done">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setProject(data.project);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // 토스트 자동 제거
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function options(): ExportOptions {
    return { format, size, watermark };
  }

  async function exportCutBlob(c: RawCut) {
    const canvas = await renderCutToCanvas(rawToExportCut(c), options());
    return canvasToBlob(canvas, format);
  }

  async function downloadCut(c: RawCut, idx: number) {
    if (!project) return;
    const key = `dl-${c.id}`;
    setBusyKey(key);
    try {
      const blob = await exportCutBlob(c);
      downloadBlob(blob, `${sanitize(project.title)}_cut${idx + 1}.${format}`);
    } catch (e) {
      setToast("다운로드 실패: " + (e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  async function copyCut(c: RawCut) {
    const key = `cp-${c.id}`;
    setBusyKey(key);
    try {
      const canvas = await renderCutToCanvas(rawToExportCut(c), {
        ...options(),
        format: "png",
      });
      const blob = await canvasToBlob(canvas, "png");
      if (!navigator.clipboard?.write) {
        throw new Error("이 브라우저는 클립보드 이미지 복사를 지원하지 않습니다.");
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setToast("클립보드에 복사되었습니다!");
    } catch (e) {
      setToast("복사 실패: " + (e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  async function shareCut(c: RawCut, idx: number) {
    if (!project) return;
    try {
      const blob = await exportCutBlob(c);
      const file = new File([blob], `${sanitize(project.title)}_cut${idx + 1}.${format}`, {
        type: blob.type,
      });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: project.title });
      } else {
        // 폴백: 다운로드
        downloadBlob(blob, `${sanitize(project.title)}_cut${idx + 1}.${format}`);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setToast("공유 실패: " + (e as Error).message);
      }
    }
  }

  async function downloadAllZip() {
    if (!project) return;
    setBusyKey("zip");
    setZipStatus("zipping");
    try {
      const zip = new JSZip();
      for (let i = 0; i < project.cuts.length; i++) {
        const c = project.cuts[i];
        const blob = await exportCutBlob(c);
        zip.file(`cut${i + 1}.${format}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${sanitize(project.title)}.zip`);
      setZipStatus("done");
      setToast("ZIP 다운로드 완료!");
    } catch (e) {
      setToast("ZIP 생성 실패: " + (e as Error).message);
      setZipStatus("idle");
    } finally {
      setBusyKey(null);
      setTimeout(() => setZipStatus("idle"), 3000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#7CAF8A] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBF5] text-gray-400">
        프로젝트를 찾을 수 없습니다.
      </div>
    );
  }

  const sortedCuts = [...project.cuts].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      {/* 헤더 */}
      <div className="border-b border-[#E8F0EB] bg-white px-4 py-3 flex items-center justify-between">
        <Link
          href={`/dashboard/projects/${id}`}
          className="text-sm text-[#7CAF8A] hover:underline"
        >
          ← 돌아가기
        </Link>
        <h1 className="font-semibold text-gray-900 truncate max-w-xs text-sm">
          {project.title} 내보내기
        </h1>
        <div className="w-16" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* 옵션 패널 */}
        <section className="rounded-2xl border border-[#E8F0EB] bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">내보내기 옵션</h2>
          <div className="flex flex-wrap gap-4 items-end">
            {/* 포맷 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">포맷</p>
              <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
                {(["png", "jpg"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      format === f ? "bg-white shadow text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 해상도 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">해상도</p>
              <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      size === s ? "bg-white shadow text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            {/* 정사각 */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={square}
                onChange={(e) => setSquare(e.target.checked)}
                className="accent-[#7CAF8A]"
              />
              1:1 정사각
            </label>

            {/* 워터마크 */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={watermark}
                onChange={(e) => setWatermark(e.target.checked)}
                className="accent-[#7CAF8A]"
              />
              워터마크
            </label>

            {/* ZIP 버튼 */}
            <div className="ml-auto">
              <button
                onClick={downloadAllZip}
                disabled={busyKey !== null}
                className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                  zipStatus === "done"
                    ? "bg-[#7CAF8A]"
                    : zipStatus === "zipping"
                    ? "bg-gray-400"
                    : "bg-gray-900 hover:bg-gray-700"
                }`}
              >
                {zipStatus === "zipping"
                  ? "압축 중..."
                  : zipStatus === "done"
                  ? "완료! ✓"
                  : "전체 ZIP 다운로드"}
              </button>
            </div>
          </div>
        </section>

        {/* 뷰 모드 전환 */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
            {(["grid", "carousel"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === m ? "bg-white shadow text-gray-900" : "text-gray-500"
                }`}
              >
                {m === "grid" ? "그리드" : "캐러셀"}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{sortedCuts.length}컷</span>
        </div>

        {/* 캐러셀 뷰 */}
        {viewMode === "carousel" && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#E8F0EB] bg-white">
              <div className={`${square ? "aspect-square" : "aspect-[4/3]"} bg-[#F5F9F6]`}>
                {sortedCuts[carouselIdx]?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sortedCuts[carouselIdx].imageUrl!}
                    alt={`컷 ${carouselIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-200 text-2xl">
                    🖼️
                  </div>
                )}
              </div>
              {/* 좌우 네비 */}
              <button
                onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))}
                disabled={carouselIdx === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow px-3 py-2 text-gray-600 disabled:opacity-30"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setCarouselIdx((i) => Math.min(sortedCuts.length - 1, i + 1))
                }
                disabled={carouselIdx === sortedCuts.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow px-3 py-2 text-gray-600 disabled:opacity-30"
              >
                →
              </button>
              {/* 인디케이터 */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {sortedCuts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIdx(i)}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === carouselIdx ? "bg-[#7CAF8A]" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 캐러셀 액션 */}
            <div className="flex gap-2">
              <button
                onClick={() => downloadCut(sortedCuts[carouselIdx], carouselIdx)}
                disabled={busyKey !== null || !sortedCuts[carouselIdx]?.imageUrl}
                className="flex-1 rounded-full bg-[#7CAF8A] py-2.5 text-sm font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-50"
              >
                {busyKey === `dl-${sortedCuts[carouselIdx]?.id}` ? "..." : "다운로드"}
              </button>
              <button
                onClick={() => shareCut(sortedCuts[carouselIdx], carouselIdx)}
                disabled={busyKey !== null || !sortedCuts[carouselIdx]?.imageUrl}
                className="flex-1 rounded-full border border-[#E8F0EB] py-2.5 text-sm font-medium text-gray-600 hover:bg-[#F0F7F2] disabled:opacity-50"
              >
                공유
              </button>
            </div>
          </div>
        )}

        {/* 그리드 뷰 */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {sortedCuts.map((c, i) => (
              <div
                key={c.id}
                className="rounded-2xl border border-[#E8F0EB] bg-white overflow-hidden"
              >
                <div className={`${square ? "aspect-square" : "aspect-[4/3]"} bg-[#F5F9F6]`}>
                  {c.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.imageUrl}
                      alt={`컷 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-200 text-xl">
                      🖼️
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600">컷 {i + 1}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => downloadCut(c, i)}
                      disabled={busyKey !== null || !c.imageUrl}
                      className="flex-1 rounded-lg bg-[#7CAF8A] px-2 py-1.5 text-xs font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-50"
                    >
                      {busyKey === `dl-${c.id}` ? "..." : "↓"}
                    </button>
                    <button
                      onClick={() => copyCut(c)}
                      disabled={busyKey !== null || !c.imageUrl}
                      className="flex-1 rounded-lg border border-[#E8F0EB] px-2 py-1.5 text-xs text-gray-600 hover:bg-[#F0F7F2] disabled:opacity-50"
                    >
                      {busyKey === `cp-${c.id}` ? "..." : "복사"}
                    </button>
                    <button
                      onClick={() => shareCut(c, i)}
                      disabled={busyKey !== null || !c.imageUrl}
                      className="flex-1 rounded-lg border border-[#E8F0EB] px-2 py-1.5 text-xs text-gray-600 hover:bg-[#F0F7F2] disabled:opacity-50 md:hidden"
                      title="공유"
                    >
                      ↗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </main>
  );
}
