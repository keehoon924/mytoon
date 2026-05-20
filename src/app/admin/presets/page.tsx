"use client";

import { useEffect, useState } from "react";

type Preset = {
  id: string; name: string;
  referenceImageUrl: string; descriptionPrompt: string | null;
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
    fetch("/api/admin/preset-characters").then((r) => r.json()).then((data) => {
      if (!cancelled && data.presets) setPresets(data.presets);
    });
    return () => { cancelled = true; };
  }, [tick]);

  async function handleCreate() {
    if (!newName.trim() || !newImage) { setError("이름과 이미지가 필요합니다."); return; }
    setBusy(true); setError("");
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
    if (!res.ok) { setError(data.error ?? "실패"); return; }
    setShowNew(false);
    setNewName(""); setNewPrompt(""); setNewImage(null);
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
      body: JSON.stringify({ name: editName.trim(), descriptionPrompt: editPrompt.trim() || null }),
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">프리셋 캐릭터</h1>
        <button onClick={() => setShowNew(true)}
          className="rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white">
          + 새 프리셋
        </button>
      </div>

      {showNew && (
        <div className="rounded-xl border bg-white p-4 mb-4 flex flex-col gap-3">
          <p className="font-semibold text-sm">새 프리셋</p>
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="이름 (예: 빨간머리 소녀)"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black" />
          <textarea value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)}
            rows={2}
            placeholder="설명 프롬프트 (선택)"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black" />
          <input type="file" accept="image/png,image/jpeg,image/webp"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setNewImage(await fileToDataUrl(f));
            }} />
          {newImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={newImage} alt="preview" className="w-24 h-24 rounded object-cover" />
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowNew(false); setError(""); }}
              className="text-sm text-gray-500 hover:text-black">취소</button>
            <button disabled={busy} onClick={handleCreate}
              className="rounded-full bg-black px-5 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "..." : "등록"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {presets.map((p) => (
          <div key={p.id} className="rounded-xl border bg-white overflow-hidden">
            <div className="aspect-square bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.referenceImageUrl} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex flex-col gap-2">
              {editingId === p.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="rounded border border-gray-200 px-2 py-1 text-xs" />
                  <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} rows={2}
                    className="rounded border border-gray-200 px-2 py-1 text-xs" />
                  <div className="flex gap-1">
                    <button disabled={busy} onClick={saveEdit}
                      className="flex-1 rounded bg-black text-white text-xs py-1 disabled:opacity-50">저장</button>
                    <button onClick={() => setEditingId(null)}
                      className="flex-1 rounded border text-xs py-1">취소</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[2em]">{p.descriptionPrompt ?? "-"}</p>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(p)}
                      className="flex-1 text-xs text-gray-600 hover:text-black border rounded py-1">편집</button>
                    <button onClick={() => handleDelete(p)}
                      className="flex-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded py-1">삭제</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {presets.length === 0 && (
        <p className="text-center text-gray-400 py-12">프리셋이 없습니다.</p>
      )}
    </div>
  );
}
