"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Character = { id: string; name: string; referenceImageUrl: string | null };

const LAYOUTS: { id: string; label: string; cols: number; rows: number }[] = [
  { id: "2x2", label: "2×2 (4컷)", cols: 2, rows: 2 },
  { id: "2x3", label: "2×3 (6컷)", cols: 2, rows: 3 },
  { id: "1x4", label: "1×4 세로 (4컷)", cols: 1, rows: 4 },
  { id: "2x4", label: "2×4 (8컷)", cols: 2, rows: 4 },
  { id: "2x5", label: "2×5 (10컷)", cols: 2, rows: 5 },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 캐릭터
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);

  // 시나리오
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");

  // 레이아웃
  const [layout, setLayout] = useState(LAYOUTS[0]);

  // 생성 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((d) => setCharacters(d.characters ?? []));
  }, []);

  function toggleChar(id: string) {
    setSelectedChars((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    setError("");
    setLoading(true);

    // 1. 프로젝트 생성
    const cutCount = layout.cols * layout.rows;
    const createRes = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || story.slice(0, 30), cutCount, layoutType: layout.id }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setError(createData.error);
      setLoading(false);
      return;
    }

    const projectId: string = createData.project.id;

    // 2. 자동 생성
    const genRes = await fetch(`/api/projects/${projectId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story, characterIds: selectedChars, mode: "auto" }),
    });
    const genData = await genRes.json();
    setLoading(false);

    if (!genRes.ok) {
      setError(genData.error);
      return;
    }

    router.push(`/dashboard/projects/${projectId}`);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-black">
          ←
        </button>
        <h1 className="font-semibold text-gray-900">새 작품 만들기</h1>
      </header>

      {/* 스텝 인디케이터 */}
      <div className="mx-auto max-w-lg px-6 py-6">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  step >= s ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`h-px flex-1 w-8 ${step > s ? "bg-black" : "bg-gray-200"}`} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-500">
            {step === 1 && "캐릭터 선택"}
            {step === 2 && "시나리오 입력"}
            {step === 3 && "레이아웃 선택"}
          </div>
        </div>

        {/* 스텝 1: 캐릭터 선택 */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">캐릭터 선택</h2>
            <p className="text-sm text-gray-400 mb-4">등장할 캐릭터를 고르세요. (선택사항)</p>
            {characters.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 캐릭터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleChar(c.id)}
                    className={`rounded-xl border-2 p-3 text-center transition-colors ${
                      selectedChars.includes(c.id) ? "border-black bg-gray-50" : "border-gray-200"
                    }`}
                  >
                    {c.referenceImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.referenceImageUrl} alt={c.name} className="mx-auto h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-xl">?</div>
                    )}
                    <p className="mt-1 text-xs font-medium text-gray-800">{c.name}</p>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              className="mt-8 w-full rounded-full bg-black py-2.5 text-sm font-semibold text-white"
            >
              다음
            </button>
          </div>
        )}

        {/* 스텝 2: 시나리오 */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">시나리오 입력</h2>
            <p className="text-sm text-gray-400 mb-4">한 줄로 줄거리를 입력하면 AI가 컷별로 나눠드립니다.</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">작품 제목 (선택)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 월요일 아침의 비극"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">줄거리 *</label>
                <textarea
                  required
                  rows={4}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="예: 알람을 끄고 다시 잠들었다가 지각한 직장인의 하루"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-medium"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!story.trim()}
                className="flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* 스텝 3: 레이아웃 */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">레이아웃 선택</h2>
            <p className="text-sm text-gray-400 mb-4">컷 수와 배치를 선택하세요.</p>
            <div className="flex flex-col gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayout(l)}
                  className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                    layout.id === l.id ? "border-black bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <span className="font-medium text-gray-900">{l.label}</span>
                  <span className="ml-2 text-sm text-gray-400">({l.cols * l.rows}컷)</span>
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-medium"
              >
                이전
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? `생성 중... (${layout.cols * layout.rows}크레딧)` : `AI 생성 시작 (${layout.cols * layout.rows}크레딧)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
