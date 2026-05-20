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
  id: string; type: string; text: string; font: string;
  color: string; fontSize: number; bold: boolean;
  x: number; y: number; w: number; h: number;
  rotation: number; zIndex: number;
};
type RawCut = {
  id: string; orderIndex: number; imageUrl: string | null;
  bubbles: Bubble[]; overlayJson: ExportCut["overlay"] | null;
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
  const [watermark, setWatermark] = useState(false);

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setProject(data.project); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  function options(): ExportOptions { return { format, size, watermark }; }

  async function exportCutBlob(c: RawCut) {
    const canvas = await renderCutToCanvas(rawToExportCut(c), options());
    return canvasToBlob(canvas, format);
  }

  async function downloadCut(c: RawCut, idx: number) {
    if (!project) return;
    const key = `dl-${c.id}`;
    setBusyKey(key); setStatusMsg("");
    try {
      const blob = await exportCutBlob(c);
      downloadBlob(blob, `${sanitize(project.title)}_cut${idx + 1}.${format}`);
    } catch (e) {
      setStatusMsg("실패: " + (e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  async function copyCut(c: RawCut) {
    const key = `cp-${c.id}`;
    setBusyKey(key); setStatusMsg("");
    try {
      const canvas = await renderCutToCanvas(rawToExportCut(c), { ...options(), format: "png" });
      const blob = await canvasToBlob(canvas, "png");
      if (!navigator.clipboard?.write) {
        throw new Error("이 브라우저는 클립보드 이미지 복사를 지원하지 않습니다.");
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setStatusMsg("클립보드에 복사되었습니다.");
    } catch (e) {
      setStatusMsg("복사 실패: " + (e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  async function downloadAllZip() {
    if (!project) return;
    setBusyKey("zip"); setStatusMsg("");
    try {
      const zip = new JSZip();
      for (let i = 0; i < project.cuts.length; i++) {
        const c = project.cuts[i];
        const blob = await exportCutBlob(c);
        zip.file(`cut${i + 1}.${format}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${sanitize(project.title)}.zip`);
    } catch (e) {
      setStatusMsg("zip 생성 실패: " + (e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">불러오는 중...</div>;
  }
  if (!project) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link href={`/dashboard/projects/${id}`} className="text-gray-500 hover:text-black text-sm">← 돌아가기</Link>
        <h1 className="font-semibold text-gray-900 truncate max-w-xs">{project.title} 내보내기</h1>
        <div className="w-20" />
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* 옵션 */}
        <section className="rounded-xl border bg-white p-5 mb-6 flex flex-wrap gap-6 items-end">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">포맷</p>
            <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
              {(["png", "jpg"] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${format === f ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">해상도</p>
            <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
              {SIZE_OPTIONS.map((s) => (
                <button key={s} onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium ${size === s ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                  {s}px
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} />
            워터마크 표시
          </label>
          <button
            onClick={downloadAllZip}
            disabled={busyKey !== null}
            className="ml-auto rounded-full bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busyKey === "zip" ? "압축 중..." : "전체 ZIP 다운로드"}
          </button>
        </section>

        {statusMsg && <p className="text-xs text-gray-500 mb-3">{statusMsg}</p>}

        {/* 컷 목록 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {project.cuts.map((c, i) => (
            <div key={c.id} className="rounded-xl border bg-white overflow-hidden">
              <div className="aspect-square bg-gray-100">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={`컷 ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300 text-sm">컷 {i + 1}</div>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2">
                <p className="text-xs text-gray-500">컷 {i + 1}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => downloadCut(c, i)}
                    disabled={busyKey !== null || !c.imageUrl}
                    className="flex-1 rounded-lg bg-black px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {busyKey === `dl-${c.id}` ? "..." : "다운로드"}
                  </button>
                  <button
                    onClick={() => copyCut(c)}
                    disabled={busyKey !== null || !c.imageUrl}
                    className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {busyKey === `cp-${c.id}` ? "..." : "복사"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
