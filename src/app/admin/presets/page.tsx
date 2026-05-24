"use client";

import { useEffect, useState } from "react";

type Preset = {
  id: string;
  name: string;
  referenceImageUrl: string;
  descriptionPrompt: string | null;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

export default function AdminPresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch("/api/admin/preset-characters")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.presets) setPresets(data.presets);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tick]);

  async function handleCreate() {
    if (!newName.trim() || !newImage) {
      setError("이름과 이미지가 필요합니다.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/preset-characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        descriptionPrompt: newPrompt.trim() || undefined,
        imageBase64: newImage,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "실패");
      return;
    }
    setShowNew(false);
    setNewName("");
    setNewPrompt("");
    setNewImage(null);
    setTick((t) => t + 1);
  }

  function startEdit(p: Preset) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrompt(p.descriptionPrompt ?? "");
  }

  async function saveEdit() {
    if (!editingId) return;
    setBusy(true);
    const res = await fetch(`/api/admin/preset-characters/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        descriptionPrompt: editPrompt.trim() || null,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setEditingId(null);
      setTick((t) => t + 1);
    }
  }

  async function handleDelete(p: Preset) {
    if (!confirm(`"${p.name}" 프리셋을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/preset-characters/${p.id}`, { method: "DELETE" });
    if (res.ok) setPresets((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">프리셋 캐릭터</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "불러오는 중..." : `${presets.length}개 등록됨`}
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setError(""); }}
          className="flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          새 프리셋
        </button>
      </div>

      {/* 새 프리셋 폼 */}
      {showNew && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 mb-6">
          <h2 className="font-semibold text-sm text-purple-900 mb-4">새 프리셋 등록</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이름 *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 빨간머리 소녀"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">설명 프롬프트 (선택)</label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                rows={3}
                placeholder="영문 캐릭터 설명 프롬프트..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이미지 *</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setNewImage(await fileToDataUrl(f));
                }}
                className="text-sm text-gray-600"
              />
              {newImage && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={newImage}
                    alt="미리보기"
                    className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                  />
                </div>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setShowNew(false); setError(""); setNewName(""); setNewPrompt(""); setNewImage(null); }}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-white"
              >
                취소
              </button>
              <button
                disabled={busy}
                onClick={handleCreate}
                className="rounded-full bg-purple-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {busy ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프리셋 그리드 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-white overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-100" />
              <div className="p-3">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {presets.map((p) => (
            <div key={p.id} className="rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.referenceImageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 flex flex-col gap-2">
                {editingId === p.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300"
                    />
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-purple-300"
                    />
                    <div className="flex gap-1">
                      <button
                        disabled={busy}
                        onClick={saveEdit}
                        className="flex-1 rounded-lg bg-purple-600 text-white text-xs py-1.5 disabled:opacity-50 hover:bg-purple-700"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-lg border border-gray-200 text-xs py-1.5 hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 min-h-[2.5em]">
                      {p.descriptionPrompt ?? "프롬프트 없음"}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="flex-1 rounded-lg border border-gray-200 text-xs py-1.5 text-gray-600 hover:bg-gray-50"
                      >
                        편집
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="flex-1 rounded-lg border border-red-200 text-xs py-1.5 text-red-500 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && presets.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎭</p>
          <p className="text-sm">등록된 프리셋 캐릭터가 없습니다.</p>
          <p className="text-xs mt-1">위 버튼으로 추가해 주세요.</p>
        </div>
      )}
    </div>
  );
}
