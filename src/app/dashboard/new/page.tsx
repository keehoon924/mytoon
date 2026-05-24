"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CharacterPicker from "@/components/CharacterPicker";
import { TEMPLATES, Template } from "@/lib/templates";
import { ART_STYLES, ArtStyle } from "@/lib/art-styles";

type ManualScenario = { description: string; dialogue: string };
type Step = 1 | 2 | 3 | 4;

function NewProjectWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic") ?? "";
  const templateParam = searchParams.get("template") ?? "";

  const [step, setStep] = useState<Step>(1);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  // 1단계: 템플릿
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    TEMPLATES.find((t) => t.id === templateParam) ?? null
  );

  // 2단계: 아트스타일
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null);

  // 3단계: 캐릭터 멀티 선택
  const [selectedChars, setSelectedChars] = useState<string[]>([]);

  // 4단계: 주제 입력
  const [title, setTitle] = useState("");
  const [story, setStory] = useState(topicParam);
  const [inputMode, setInputMode] = useState<"auto" | "manual">("auto");
  const [manualScenarios, setManualScenarios] = useState<ManualScenario[]>([]);

  // 생성 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 크레딧 잔액 조회
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => {
        if (d.balance !== undefined) setCreditBalance(d.balance);
      })
      .catch(() => {});
  }, []);

  const cutCount = selectedTemplate?.cutCount ?? 4;

  function handleTemplateSelect(t: Template) {
    setSelectedTemplate(t);
    setManualScenarios(
      Array.from({ length: t.cutCount }, (_, i) =>
        manualScenarios[i] ?? { description: "", dialogue: "" }
      )
    );
  }

  function updateManual(index: number, field: keyof ManualScenario, value: string) {
    setManualScenarios((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  async function handleGenerate() {
    if (!selectedTemplate) return;
    setError("");
    setLoading(true);

    const projectTitle =
      title ||
      (story ? story.slice(0, 30) : `새 작품 ${new Date().toLocaleDateString("ko-KR")}`);

    const createRes = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: projectTitle,
        cutCount: selectedTemplate.cutCount,
        layoutType: selectedTemplate.layoutType,
      }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) {
      setError(createData.error ?? "프로젝트 생성 실패");
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
        artStyle: selectedStyle?.id,
        template: selectedTemplate.id,
        ...(inputMode === "manual" ? { manualScenarios } : {}),
      }),
    });
    const genData = await genRes.json();
    setLoading(false);

    if (!genRes.ok) {
      setError(genData.error ?? "생성 중 오류가 발생했습니다.");
      return;
    }

    router.push(`/dashboard/projects/${projectId}`);
  }

  const STEP_LABELS: Record<Step, string> = {
    1: "템플릿",
    2: "아트스타일",
    3: "캐릭터",
    4: "주제 입력",
  };

  const canGoNext = (s: Step) => {
    if (s === 1) return !!selectedTemplate;
    if (s === 2) return !!selectedStyle;
    if (s === 3) return true; // 캐릭터는 선택 안 해도 됨
    return false;
  };

  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      <div className="mx-auto max-w-xl px-4 py-8 md:py-12">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full border border-[#E8F0EB] p-2 text-gray-500 hover:bg-[#F0F7F2]"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900">새 작품 만들기</h1>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="mb-8 flex items-center justify-between">
          {([1, 2, 3, 4] as Step[]).map((s, idx) => (
            <div key={s} className="flex flex-1 items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step === s
                    ? "bg-[#7CAF8A] text-white"
                    : step > s
                    ? "bg-[#7CAF8A]/30 text-[#7CAF8A]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              <span
                className={`ml-1.5 text-xs hidden sm:block ${
                  step === s ? "font-semibold text-[#7CAF8A]" : "text-gray-400"
                }`}
              >
                {STEP_LABELS[s]}
              </span>
              {idx < 3 && (
                <div
                  className={`mx-2 flex-1 h-px ${step > s ? "bg-[#7CAF8A]" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 스텝 1: 템플릿 선택 */}
        {step === 1 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-gray-900">템플릿 선택</h2>
            <p className="mb-5 text-sm text-gray-400">작품 형식을 고르세요.</p>
            <div className="space-y-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    selectedTemplate?.id === t.id
                      ? "border-[#7CAF8A] bg-[#F0F7F2]"
                      : "border-[#E8F0EB] bg-white hover:border-[#7CAF8A]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.description}</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {t.cutCount}컷
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!canGoNext(1)}
              className="mt-8 w-full rounded-full bg-[#7CAF8A] py-3 text-sm font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-40"
            >
              다음 →
            </button>
          </div>
        )}

        {/* 스텝 2: 아트스타일 선택 */}
        {step === 2 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-gray-900">아트스타일 선택</h2>
            <p className="mb-5 text-sm text-gray-400">원하는 그림 스타일을 고르세요.</p>
            <div className="space-y-3">
              {ART_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    selectedStyle?.id === s.id
                      ? "border-[#7CAF8A] bg-[#F0F7F2]"
                      : "border-[#E8F0EB] bg-white hover:border-[#7CAF8A]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border border-[#E8F0EB] py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                ← 이전
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoNext(2)}
                className="flex-1 rounded-full bg-[#7CAF8A] py-3 text-sm font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-40"
              >
                다음 →
              </button>
            </div>
          </div>
        )}

        {/* 스텝 3: 캐릭터 멀티 선택 */}
        {step === 3 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-gray-900">캐릭터 선택</h2>
            <p className="mb-5 text-sm text-gray-400">
              등장할 캐릭터를 선택하세요. 여러 명 선택 가능 (선택 안 해도 됩니다).
            </p>
            <CharacterPicker
              selectedIds={selectedChars}
              onChange={setSelectedChars}
            />
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-full border border-[#E8F0EB] py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                ← 이전
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 rounded-full bg-[#7CAF8A] py-3 text-sm font-semibold text-white hover:bg-[#6a9e79]"
              >
                다음 →
              </button>
            </div>
          </div>
        )}

        {/* 스텝 4: 주제 입력 */}
        {step === 4 && (
          <div>
            <h2 className="mb-1 text-lg font-bold text-gray-900">주제 입력</h2>
            <p className="mb-5 text-sm text-gray-400">
              인스타툰의 줄거리나 주제를 입력하세요.
            </p>

            {/* 잔액·차감 표시 */}
            {creditBalance !== null && (
              <div className="mb-5 flex items-center justify-between rounded-xl bg-[#F0F7F2] px-4 py-2.5 text-sm">
                <span className="text-gray-600">
                  잔액 <strong className="text-[#7CAF8A]">{creditBalance}</strong>
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">
                  이번 <strong className="text-gray-700">{cutCount}</strong> 크레딧 차감
                </span>
              </div>
            )}

            {/* AI 자동 / 컷별 직접 토글 */}
            <div className="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1">
              {(["auto", "manual"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setInputMode(m);
                    if (m === "manual" && manualScenarios.length !== cutCount) {
                      setManualScenarios(
                        Array.from({ length: cutCount }, (_, i) =>
                          manualScenarios[i] ?? { description: "", dialogue: "" }
                        )
                      );
                    }
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    inputMode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                  }`}
                >
                  {m === "auto" ? "AI 자동 생성" : "컷별 직접 입력"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  작품 제목 (선택)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 월요일 아침의 비극"
                  className="w-full rounded-lg border border-[#E8F0EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {inputMode === "auto" ? "줄거리 *" : "전체 줄거리 (빈 컷 AI 보강에 사용)"}
                </label>
                <textarea
                  rows={3}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="예: 알람을 끄고 다시 잠들었다가 지각한 직장인의 하루"
                  required={inputMode === "auto"}
                  className="w-full resize-none rounded-lg border border-[#E8F0EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
                />
              </div>

              {/* 컷별 직접 입력 */}
              {inputMode === "manual" && (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                  {manualScenarios.map((s, i) => (
                    <div key={i} className="rounded-xl border border-[#E8F0EB] bg-white p-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2">컷 {i + 1}</p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={s.description}
                          onChange={(e) => updateManual(i, "description", e.target.value)}
                          placeholder="장면 설명 (비우면 AI 자동)"
                          className="w-full rounded-lg border border-[#E8F0EB] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7CAF8A]"
                        />
                        <input
                          type="text"
                          value={s.dialogue}
                          onChange={(e) => updateManual(i, "dialogue", e.target.value)}
                          placeholder="대사 (선택)"
                          className="w-full rounded-lg border border-[#E8F0EB] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7CAF8A]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-full border border-[#E8F0EB] py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                ← 이전
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || (inputMode === "auto" && !story.trim())}
                className="flex-1 rounded-full bg-[#7CAF8A] py-3 text-sm font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    생성 중...
                  </span>
                ) : (
                  `AI 생성 (${cutCount}크레딧)`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center text-gray-400">로딩 중...</div>}>
      <NewProjectWizard />
    </Suspense>
  );
}
