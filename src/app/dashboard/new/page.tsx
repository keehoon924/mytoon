"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Character = { id: string; name: string; referenceImageUrl: string | null };
type ManualScenario = { description: string; dialogue: string };

const LAYOUTS: { id: string; label: string; cols: number; rows: number }[] = [
  { id: "2x2", label: "2×2 (4컷)", cols: 2, rows: 2 },
  { id: "2x3", label: "2×3 (6컷)", cols: 2, rows: 3 },
  { id: "1x4", label: "1×4 세로 (4컷)", cols: 1, rows: 4 },
  { id: "2x4", label: "2×4 (8컷)", cols: 2, rows: 4 },
  { id: "2x5", label: "2×5 (10컷)", cols: 2, rows: 5 },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 캐릭터
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChars, setSelectedChars] = useState<string[]>([]);

  // 입력 방식
  const [inputMode, setInputMode] = useState<"auto" | "manual">("auto");

  // 시나리오
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");

  // 레이아웃
  const [layout, setLayout] = useState(LAYOUTS[0]);

  // 직접 입력 시나리오
  const [manualScenarios, setManualScenarios] = useState<ManualScenario[]>([]);

  // 생성 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((d) => setCharacters(d.characters ?? []));
  }, []);

  // 레이아웃 변경 시 직접 입력 폼 초기화
  function handleLayoutChange(l: typeof LAYOUTS[0]) {
    setLayout(l);
    const cutCount = l.cols * l.rows;
    setManualScenarios(
      Array.from({ length: cutCount }, (_, i) =>
        manualScenarios[i] ?? { description: "", dialogue: "" }
      )
    );
  }

  function toggleChar(id: string) {
    setSelectedChars((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function updateManual(index: number, field: keyof ManualScenario, value: string) {
    setManualScenarios((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  // 스텝 2 → 3 이동 시 직접 모드면 manualScenarios 초기화
  function goToStep3() {
    const cutCount = layout.cols * layout.rows;
    if (inputMode === "manual" && manualScenarios.length !== cutCount) {
      setManualScenarios(
        Array.from({ length: cutCount }, (_, i) =>
          manualScenarios[i] ?? { description: "", dialogue: "" }
        )
      );
    }
    setStep(3);
  }

  async function handleGenerate() {
    setError("");
    setLoading(true);

    const cutCount = layout.cols * layout.rows;
    const createRes = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || (story ? story.slice(0, 30) : `새 작품 ${new Date().toLocaleDateString()}`),
        cutCount,
        layoutType: layout.id,
      }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setError(createData.error);
      setLoading(false);
      return;
    }

    const projectId: string = createData.project.id;

    const genRes = await fetch(`/api/projects/${projectId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story,
        characterIds: selectedChars,
        mode: inputMode,
        ...(inputMode === "manual" ? { manualScenarios } : {}),
      }),
    });
    const genData = await genRes.json();
    setLoading(false);

    if (!genRes.ok) {
      setError(genData.error);
      return;
    }

    router.push(`/dashboard/projects/${projectId}`);
  }

  const STEPS = inputMode === "manual" ? [1, 2, 3, 4] : [1, 2, 3];
  const totalSteps = STEPS.length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-black">←</button>
        <h1 className="font-semibold text-gray-900">새 작품 만들기</h1>
      </header>

      <div className="mx-auto max-w-lg px-6 py-6">
        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= s ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
                {idx + 1}
              </div>
              {idx < totalSteps - 1 && (
                <div className={`h-px w-8 ${step > s ? "bg-black" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {step === 1 && "캐릭터 선택"}
            {step === 2 && "입력 방식"}
            {step === 3 && (inputMode === "manual" ? "레이아웃" : "레이아웃")}
            {step === 4 && "컷별 입력"}
          </span>
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
                  <button key={c.id} onClick={() => toggleChar(c.id)}
                    className={`rounded-xl border-2 p-3 text-center transition-colors ${selectedChars.includes(c.id) ? "border-black bg-gray-50" : "border-gray-200"}`}>
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
            <button onClick={() => setStep(2)} className="mt-8 w-full rounded-full bg-black py-2.5 text-sm font-semibold text-white">다음</button>
          </div>
        )}

        {/* 스텝 2: 입력 방식 + 시나리오 */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">시나리오 입력</h2>

            {/* 방식 토글 */}
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-6">
              {(["auto", "manual"] as const).map((m) => (
                <button key={m} onClick={() => setInputMode(m)}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${inputMode === m ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                  {m === "auto" ? "AI 자동 생성" : "컷별 직접 입력"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">작품 제목 (선택)</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 월요일 아침의 비극"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {inputMode === "auto" ? "줄거리 *" : "전체 줄거리 (선택 — 빈 컷 AI 보강에 사용)"}
                </label>
                <textarea rows={3} value={story} onChange={(e) => setStory(e.target.value)}
                  placeholder="예: 알람을 끄고 다시 잠들었다가 지각한 직장인의 하루"
                  required={inputMode === "auto"}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                {inputMode === "manual" && (
                  <p className="mt-1 text-xs text-gray-400">직접 입력하지 않은 컷은 이 줄거리를 참고해 AI가 채웁니다.</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-medium">이전</button>
              <button
                onClick={() => setStep(3)}
                disabled={inputMode === "auto" && !story.trim()}
                className="flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                다음
              </button>
            </div>
          </div>
        )}

        {/* 스텝 3: 레이아웃 선택 */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">레이아웃 선택</h2>
            <p className="text-sm text-gray-400 mb-4">컷 수와 배치를 선택하세요.</p>
            <div className="flex flex-col gap-2">
              {LAYOUTS.map((l) => (
                <button key={l.id} onClick={() => handleLayoutChange(l)}
                  className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${layout.id === l.id ? "border-black bg-gray-50" : "border-gray-200"}`}>
                  <span className="font-medium text-gray-900">{l.label}</span>
                  <span className="ml-2 text-sm text-gray-400">({l.cols * l.rows}크레딧 소모)</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-medium">이전</button>
              {inputMode === "manual" ? (
                <button onClick={goToStep3} className="flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-white">
                  다음 (컷별 입력)
                </button>
              ) : (
                <>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button onClick={handleGenerate} disabled={loading}
                    className="flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    {loading ? "생성 중..." : `AI 생성 (${layout.cols * layout.rows}크레딧)`}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 스텝 4: 컷별 직접 입력 (직접 모드만) */}
        {step === 4 && inputMode === "manual" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">컷별 입력</h2>
            <p className="text-sm text-gray-400 mb-4">각 컷의 장면 설명과 대사를 입력하세요. 비워두면 AI가 채웁니다.</p>
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {manualScenarios.map((s, i) => (
                <div key={i} className="rounded-xl border bg-white p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">컷 {i + 1}</p>
                  <div className="flex flex-col gap-2">
                    <input type="text" value={s.description}
                      onChange={(e) => updateManual(i, "description", e.target.value)}
                      placeholder="장면 설명 (비우면 AI 자동)"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    <input type="text" value={s.dialogue}
                      onChange={(e) => updateManual(i, "dialogue", e.target.value)}
                      placeholder="대사 (선택)"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-medium">이전</button>
              <button onClick={handleGenerate} disabled={loading}
                className="flex-1 rounded-full bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {loading ? "생성 중..." : `생성 (${layout.cols * layout.rows}크레딧)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
