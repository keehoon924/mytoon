"use client";

import { useEffect, useState } from "react";

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
  descriptionPrompt?: string | null;
};

type Tab = "PHOTO" | "TEXT" | "PRESET";

const SOURCE_LABEL: Record<string, string> = {
  TEXT: "텍스트",
  PHOTO: "사진",
  PRESET: "프리셋",
};

const SOURCE_COLOR: Record<string, string> = {
  TEXT: "bg-blue-50 text-blue-500",
  PHOTO: "bg-amber-50 text-amber-600",
  PRESET: "bg-[#E8F0EB] text-[#7CAF8A]",
};

function CharacterWizardModal({
  presets,
  onCreated,
  onCancel,
}: {
  presets: Preset[];
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<Tab>("TEXT");
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body: Record<string, string> = { name, sourceType: tab };
    if (tab === "TEXT") body.descriptionPrompt = prompt;
    if (tab === "PHOTO") body.imageBase64 = photoBase64;
    if (tab === "PRESET") body.presetId = selectedPreset;

    const res = await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "오류가 발생했습니다.");
      return;
    }
    onCreated();
  }

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: "TEXT", label: "텍스트 설명", emoji: "✍️" },
    { key: "PHOTO", label: "사진 업로드", emoji: "📸" },
    { key: "PRESET", label: "프리셋 선택", emoji: "🎨" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFBF5] shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="bg-white border-b border-[#E8F0EB] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">캐릭터 등록</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* 등록 방식 탭 */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-xs font-medium transition-colors ${
                  tab === t.key
                    ? "border-[#7CAF8A] bg-[#F0F7F2] text-[#7CAF8A]"
                    : "border-[#E8F0EB] bg-white text-gray-500 hover:border-[#7CAF8A]"
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                캐릭터 이름
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 춘식이, 내 아바타"
                className="w-full rounded-lg border border-[#E8F0EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
              />
            </div>

            {/* 방식별 입력 */}
            {tab === "TEXT" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  외모 설명
                </label>
                <textarea
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="예: 갈색 단발머리, 둥근 눈, 귀여운 20대 여성, 캐주얼 스타일"
                  className="w-full rounded-lg border border-[#E8F0EB] bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
                />
                <p className="mt-1 text-xs text-gray-400">
                  구체적일수록 일관된 캐릭터가 생성됩니다.
                </p>
              </div>
            )}

            {tab === "PHOTO" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  사진 업로드
                </label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-[#7CAF8A]"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-[#F0F7F2] border-2 border-dashed border-[#E8F0EB] flex items-center justify-center text-2xl">
                      📸
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer rounded-lg border-2 border-dashed border-[#E8F0EB] bg-white p-3 text-center hover:border-[#7CAF8A] transition-colors">
                    <span className="text-sm text-gray-500">클릭해서 사진 선택</span>
                    <input
                      type="file"
                      accept="image/*"
                      required={!photoBase64}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  얼굴이 잘 보이는 사진을 사용하면 더 정확한 캐릭터가 생성됩니다.
                </p>
              </div>
            )}

            {tab === "PRESET" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  프리셋 선택
                </label>
                {presets.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">
                    등록된 프리셋이 없습니다.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-colors ${
                          selectedPreset === preset.id
                            ? "border-[#7CAF8A] bg-[#F0F7F2]"
                            : "border-[#E8F0EB] bg-white hover:border-[#7CAF8A]"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.referenceImageUrl}
                          alt={preset.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-gray-700 text-center">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-full border border-[#E8F0EB] py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading || (tab === "PRESET" && !selectedPreset)}
                className="flex-1 rounded-full bg-[#7CAF8A] py-2.5 text-sm font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-50"
              >
                {loading ? "등록 중..." : "캐릭터 등록"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
      setLoading(true);
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

  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">내 캐릭터</h1>
          <button
            onClick={() => setShowWizard(true)}
            className="rounded-full bg-[#7CAF8A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6a9e79]"
          >
            + 캐릭터 추가
          </button>
        </div>

        {loading ? (
          /* 스켈레톤 */
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E8F0EB] bg-white p-4 flex flex-col items-center gap-3 animate-pulse"
              >
                <div className="h-20 w-20 rounded-full bg-gray-100" />
                <div className="h-3 w-20 rounded bg-gray-100" />
                <div className="h-2 w-12 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : characters.length === 0 ? (
          /* 빈 상태 */
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🙂</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              등록된 캐릭터가 없어요
            </h2>
            <p className="text-gray-400 mb-8">
              나만의 캐릭터를 등록하면 인스타툰에 항상 같은 캐릭터가 등장해요.
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="rounded-full bg-[#7CAF8A] px-8 py-3 text-sm font-semibold text-white hover:bg-[#6a9e79]"
            >
              첫 캐릭터 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {characters.map((c) => (
              <div
                key={c.id}
                className="group rounded-xl border border-[#E8F0EB] bg-white p-4 flex flex-col items-center gap-2 hover:shadow-sm transition-shadow"
              >
                {/* 아바타 */}
                {c.referenceImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.referenceImageUrl}
                    alt={c.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-[#E8F0EB]"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-[#F0F7F2] border-2 border-[#E8F0EB] flex items-center justify-center text-3xl">
                    🙂
                  </div>
                )}

                {/* 이름 (편집 가능) */}
                {editingId === c.id ? (
                  <div className="flex gap-1 w-full">
                    <input
                      value={editName}
                      autoFocus
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(c.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 rounded border border-[#E8F0EB] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#7CAF8A]"
                    />
                    <button
                      onClick={() => handleRename(c.id)}
                      className="text-xs font-medium text-[#7CAF8A]"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-900 text-center">{c.name}</p>
                )}

                {/* 소스 타입 */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    SOURCE_COLOR[c.sourceType] ?? "bg-gray-100 text-gray-400"
                  }`}
                >
                  {SOURCE_LABEL[c.sourceType] ?? c.sourceType}
                </span>

                {/* 액션 */}
                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                    }}
                    className="text-xs text-gray-400 hover:text-gray-700 underline"
                  >
                    이름 변경
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-400 hover:text-red-600 underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {/* 추가 버튼 카드 */}
            <button
              onClick={() => setShowWizard(true)}
              className="rounded-xl border-2 border-dashed border-[#E8F0EB] flex flex-col items-center justify-center gap-2 py-8 text-[#7CAF8A] hover:border-[#7CAF8A] hover:bg-[#F0F7F2] transition-colors"
            >
              <span className="text-2xl">+</span>
              <span className="text-sm font-medium">캐릭터 추가</span>
            </button>
          </div>
        )}
      </div>

      {showWizard && (
        <CharacterWizardModal
          presets={presets}
          onCreated={() => {
            setShowWizard(false);
            refresh();
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </main>
  );
}
