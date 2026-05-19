"use client";

import { useEffect, useState } from "react";
import CharacterWizard from "@/components/CharacterWizard";
import Link from "next/link";

type Character = {
  id: string;
  name: string;
  sourceType: string;
  referenceImageUrl: string | null;
  descriptionPrompt: string | null;
  createdAt: string;
};

type Preset = {
  id: string;
  name: string;
  referenceImageUrl: string;
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [charsRes, presetsRes] = await Promise.all([
        fetch("/api/characters"),
        fetch("/api/preset-characters"),
      ]);
      const charsData = await charsRes.json();
      const presetsData = await presetsRes.json();
      if (cancelled) return;
      if (charsRes.ok) setCharacters(charsData.characters);
      setPresets(presetsData.presets ?? []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleRename(id: string) {
    await fetch(`/api/characters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    setEditingId(null);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("캐릭터를 삭제할까요?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    refresh();
  }

  const sourceLabel: Record<string, string> = {
    TEXT: "텍스트",
    PHOTO: "사진",
    PRESET: "프리셋",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-gray-900">
          ← 내 서랍
        </Link>
        <h1 className="font-semibold text-gray-900">내 캐릭터</h1>
        <button
          onClick={() => setShowWizard(true)}
          className="rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white"
        >
          + 캐릭터 추가
        </button>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {loading ? (
          <p className="text-center text-sm text-gray-400">불러오는 중...</p>
        ) : characters.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400">등록된 캐릭터가 없습니다.</p>
            <button
              onClick={() => setShowWizard(true)}
              className="mt-4 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white"
            >
              첫 캐릭터 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {characters.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border bg-white p-4 flex flex-col items-center gap-2"
              >
                {c.referenceImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.referenceImageUrl}
                    alt={c.name}
                    className="h-24 w-24 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                    ?
                  </div>
                )}

                {editingId === c.id ? (
                  <div className="flex gap-1 w-full">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded border px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() => handleRename(c.id)}
                      className="text-xs font-medium text-black"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-900 text-center">{c.name}</p>
                )}

                <span className="text-xs text-gray-400">{sourceLabel[c.sourceType] ?? c.sourceType}</span>

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => { setEditingId(c.id); setEditName(c.name); }}
                    className="text-xs text-gray-400 hover:text-black"
                  >
                    이름 변경
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWizard && (
        <CharacterWizard
          presets={presets}
          onCreated={() => { setShowWizard(false); refresh(); }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </main>
  );
}
