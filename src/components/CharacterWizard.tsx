"use client";

import { useState } from "react";

type Tab = "TEXT" | "PHOTO" | "PRESET";

type Preset = {
  id: string;
  name: string;
  referenceImageUrl: string;
};

type Props = {
  presets: Preset[];
  onCreated: () => void;
  onCancel: () => void;
};

export default function CharacterWizard({ presets, onCreated, onCancel }: Props) {
  const [tab, setTab] = useState<Tab>("TEXT");
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "TEXT", label: "텍스트 설명" },
    { key: "PHOTO", label: "사진 업로드" },
    { key: "PRESET", label: "프리셋 선택" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">캐릭터 등록</h2>

        {/* 탭 */}
        <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* 이름 (공통) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">캐릭터 이름</label>
            <input
              type="text"
              required
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김철수"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* 텍스트 탭 */}
          {tab === "TEXT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">외모 설명</label>
              <textarea
                required
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 20대 한국 여성, 검은 단발, 둥근 안경, 캐주얼 의상"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          {/* 사진 탭 */}
          {tab === "PHOTO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">사진 업로드</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-1.5 file:text-xs file:text-white"
              />
              <p className="mt-1 text-xs text-gray-400">얼굴이 잘 보이는 사진을 올려주세요.</p>
            </div>
          )}

          {/* 프리셋 탭 */}
          {tab === "PRESET" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">프리셋 캐릭터 선택</label>
              {presets.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">등록된 프리셋이 없습니다.</p>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPreset(p.id)}
                      className={`rounded-lg border-2 p-1 text-center transition-colors ${
                        selectedPreset === p.id ? "border-black" : "border-gray-200"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.referenceImageUrl}
                        alt={p.name}
                        className="mx-auto h-16 w-16 rounded-md object-cover"
                      />
                      <p className="mt-1 text-xs text-gray-700">{p.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-medium text-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || (tab === "PRESET" && !selectedPreset)}
              className="flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "생성 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
