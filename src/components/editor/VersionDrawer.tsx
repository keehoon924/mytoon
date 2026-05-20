"use client";

import { useEffect, useState } from "react";

type Version = { id: string; createdAt: string };

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onRestored: () => void;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { hour12: false });
}

export default function VersionDrawer({ projectId, open, onClose, onRestored }: Props) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(`/api/projects/${projectId}/versions`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setVersions(data.versions ?? []); });
    return () => { cancelled = true; setVersions(null); };
  }, [open, projectId]);

  const loading = versions === null;

  async function handleRestore(vid: string) {
    if (!confirm("이 버전으로 복원하시겠습니까? 현재 편집 중인 내용은 사라집니다.")) return;
    setRestoringId(vid);
    const res = await fetch(`/api/projects/${projectId}/versions/${vid}/restore`, { method: "POST" });
    setRestoringId(null);
    if (res.ok) {
      onRestored();
      onClose();
    } else {
      alert("복원 실패");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-80 bg-white border-l shadow-xl flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="font-semibold text-sm">버전 히스토리</span>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-lg">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading && <p className="text-xs text-gray-400">불러오는 중...</p>}
          {!loading && versions!.length === 0 && (
            <p className="text-xs text-gray-400">저장된 버전이 없습니다.</p>
          )}
          {(versions ?? []).map((v, i, arr) => (
            <div key={v.id} className="flex items-center gap-2 rounded px-2 py-2 hover:bg-gray-50">
              <div className="flex-1">
                <p className="text-sm text-gray-700">{i === 0 ? "최신" : `버전 ${arr.length - i}`}</p>
                <p className="text-xs text-gray-400">{formatTime(v.createdAt)}</p>
              </div>
              <button
                onClick={() => handleRestore(v.id)}
                disabled={restoringId !== null}
                className="text-xs rounded border border-gray-200 px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
              >
                {restoringId === v.id ? "복원 중..." : "복원"}
              </button>
            </div>
          ))}
        </div>
        <p className="px-4 py-2 text-xs text-gray-400 border-t">최대 10개까지 보관됩니다.</p>
      </div>
    </div>
  );
}
