"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = {
  title: string;
  description: string;
  emoji: string;
  cta?: string;
};

const STEPS: Step[] = [
  {
    emoji: "🎉",
    title: "MyToon에 오신 걸 환영해요!",
    description:
      "한 줄 설명만 입력하면 AI가 4컷 인스타툰을 만들어 드려요. 지금 바로 시작해 보세요!",
    cta: "둘러보기",
  },
  {
    emoji: "🙂",
    title: "캐릭터를 먼저 만들어요",
    description:
      "나만의 캐릭터를 등록하면 모든 컷에 같은 캐릭터가 일관되게 등장해요. 사진, 텍스트 설명, 프리셋 중 원하는 방식으로 만들 수 있어요.",
    cta: "다음",
  },
  {
    emoji: "✍️",
    title: "주제를 입력하고 생성",
    description:
      "\"월급날의 현실\", \"강아지와의 산책\" 같은 간단한 주제만 입력하면 AI가 4컷 스토리를 완성해요.",
    cta: "다음",
  },
  {
    emoji: "✏️",
    title: "편집하고 내보내기",
    description:
      "생성된 컷에 말풍선을 추가하거나 브러시로 직접 그릴 수 있어요. 완성 후 PNG/JPG로 저장하거나 바로 공유하세요.",
    cta: "시작하기",
  },
];

type Props = {
  /** 사용자가 이미 온보딩을 완료했는지 */
  onboardedAt: string | null;
  /** URL 파라미터로 넘어온 주제 (signup 시 입력한 주제) */
  initialTopic?: string;
};

export default function OnboardingTour({ onboardedAt, initialTopic }: Props) {
  const [visible, setVisible] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // onboardedAt이 없으면 자동으로 투어 표시
    if (!onboardedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, [onboardedAt]);

  async function completeOnboarding() {
    await fetch("/api/auth/onboard", { method: "POST" });
    setVisible(false);
    // 마지막 스텝에서 새 작품 만들기로 이동
    const href = initialTopic
      ? `/dashboard/new?topic=${encodeURIComponent(initialTopic)}`
      : "/dashboard/new";
    router.push(href);
  }

  async function skipOnboarding() {
    await fetch("/api/auth/onboard", { method: "POST" });
    setVisible(false);
  }

  if (!visible) return null;

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm rounded-2xl bg-[#FFFBF5] shadow-2xl overflow-hidden sm:mb-0">
        {/* 진행 바 */}
        <div className="h-1 bg-[#E8F0EB]">
          <div
            className="h-full bg-[#7CAF8A] transition-all"
            style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-7">
          {/* 이모지 */}
          <div className="text-5xl text-center mb-4">{step.emoji}</div>

          {/* 제목 */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{step.title}</h2>

          {/* 설명 */}
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
            {step.description}
          </p>

          {/* 스텝 인디케이터 */}
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIdx ? "w-5 bg-[#7CAF8A]" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={skipOnboarding}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600"
            >
              건너뛰기
            </button>
            <button
              onClick={() => {
                if (isLast) {
                  completeOnboarding();
                } else {
                  setStepIdx((i) => i + 1);
                }
              }}
              className="flex-1 rounded-full bg-[#7CAF8A] py-2.5 text-sm font-semibold text-white hover:bg-[#6a9e79]"
            >
              {step.cta ?? "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
