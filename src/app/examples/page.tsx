"use client";

import { useState } from "react";
import Link from "next/link";
import CutPlaceholder from "@/components/illustrations/CutPlaceholder";

type ArtStyle = "감성손그림" | "심플카툰" | "수채화" | "전체";
type Topic = "일상" | "재테크" | "힐링" | "전체";

type ExampleItem = {
  id: string;
  title: string;
  artStyle: Exclude<ArtStyle, "전체">;
  topic: Exclude<Topic, "전체">;
  cuts: { emoji: string; caption: string }[];
  description: string;
};

const EXAMPLES: ExampleItem[] = [
  {
    id: "1",
    title: "커피 한 잔의 여유",
    artStyle: "감성손그림",
    topic: "일상",
    description: "바쁜 아침, 커피 한 잔이 선물하는 작은 행복을 담은 4컷 인스타툰",
    cuts: [
      { emoji: "☕", caption: "눈을 뜨자마자 커피 생각" },
      { emoji: "🫖", caption: "천천히 내리는 드립 커피" },
      { emoji: "😌", caption: "첫 모금의 행복" },
      { emoji: "✨", caption: "오늘도 파이팅!" },
    ],
  },
  {
    id: "2",
    title: "월급 도착! 그런데...",
    artStyle: "심플카툰",
    topic: "재테크",
    description: "월급날의 두근거림과 현실의 괴리를 유머러스하게 담은 4컷",
    cuts: [
      { emoji: "📱", caption: "월급 입금 알림 🔔" },
      { emoji: "😭", caption: "카드값이 기다리고 있었다" },
      { emoji: "🧮", caption: "남은 돈 계산 중..." },
      { emoji: "💪", caption: "다음 달엔 꼭 저축!" },
    ],
  },
  {
    id: "3",
    title: "비 오는 날의 산책",
    artStyle: "수채화",
    topic: "힐링",
    description: "빗소리와 함께하는 혼자만의 산책, 수채화 톤으로 담은 힐링 스토리",
    cuts: [
      { emoji: "🌧️", caption: "갑자기 내리는 비" },
      { emoji: "☂️", caption: "우산 하나 들고 나섰다" },
      { emoji: "🌿", caption: "젖은 나뭇잎 냄새" },
      { emoji: "🌈", caption: "비 갠 후의 무지개" },
    ],
  },
  {
    id: "4",
    title: "편의점 특가 공략",
    artStyle: "심플카툰",
    topic: "재테크",
    description: "편의점 1+1, 2+1 공략으로 한 달 식비 절약하는 현실 꿀팁 툰",
    cuts: [
      { emoji: "🏪", caption: "오늘도 편의점 정찰" },
      { emoji: "🔍", caption: "1+1 삼각김밥 발견!" },
      { emoji: "🛒", caption: "장바구니 가득가득" },
      { emoji: "💰", caption: "이번 달 식비 20% 절약" },
    ],
  },
  {
    id: "5",
    title: "집에서 혼자 힐링",
    artStyle: "감성손그림",
    topic: "힐링",
    description: "퇴근 후 혼자만의 시간, 아무것도 안 해도 괜찮은 그런 날",
    cuts: [
      { emoji: "🏠", caption: "드디어 집이다" },
      { emoji: "🛁", caption: "거품 목욕으로 피로 풀기" },
      { emoji: "📚", caption: "좋아하는 책 한 권" },
      { emoji: "🌙", caption: "오늘 하루도 수고했어" },
    ],
  },
  {
    id: "6",
    title: "아침형 인간 도전기",
    artStyle: "심플카툰",
    topic: "일상",
    description: "새벽 6시 기상에 도전하는 직장인의 현실 공감 4컷",
    cuts: [
      { emoji: "⏰", caption: "6시 알람 설정 완료" },
      { emoji: "😴", caption: "... 5분만 더" },
      { emoji: "😱", caption: "이미 7시 30분!!" },
      { emoji: "🏃", caption: "지각이다 뛰어어어" },
    ],
  },
  {
    id: "7",
    title: "봄날의 꽃구경",
    artStyle: "수채화",
    topic: "힐링",
    description: "벚꽃 아래 느린 산책, 봄 햇살을 수채화로 담아낸 감성 툰",
    cuts: [
      { emoji: "🌸", caption: "드디어 벚꽃 시즌" },
      { emoji: "👫", caption: "친구랑 팔짱 끼고" },
      { emoji: "📸", caption: "인생사진 한 컷" },
      { emoji: "🍡", caption: "꽃구경엔 경단이지" },
    ],
  },
  {
    id: "8",
    title: "N잡러 도전기",
    artStyle: "감성손그림",
    topic: "재테크",
    description: "부업으로 월 50만 원 더 버는 현실적인 N잡 이야기",
    cuts: [
      { emoji: "💻", caption: "퇴근 후 노트북 켜기" },
      { emoji: "✍️", caption: "블로그 글쓰기 30분" },
      { emoji: "📦", caption: "중고거래 포장 중" },
      { emoji: "📈", caption: "이번 달 +47만원!" },
    ],
  },
  {
    id: "9",
    title: "반려식물과의 동거",
    artStyle: "수채화",
    topic: "일상",
    description: "식물 초보자의 좌충우돌 식물 키우기 일기",
    cuts: [
      { emoji: "🪴", caption: "몬스테라 입양한 날" },
      { emoji: "💧", caption: "물주기 잊어버렸다..." },
      { emoji: "😰", caption: "잎이 시들시들" },
      { emoji: "🌱", caption: "그래도 새 잎이 나왔어!" },
    ],
  },
];

export default function ExamplesPage() {
  const [artStyleFilter, setArtStyleFilter] = useState<ArtStyle>("전체");
  const [topicFilter, setTopicFilter] = useState<Topic>("전체");
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [lightboxCutIndex, setLightboxCutIndex] = useState(0);

  const filtered = EXAMPLES.filter((e) => {
    const matchStyle = artStyleFilter === "전체" || e.artStyle === artStyleFilter;
    const matchTopic = topicFilter === "전체" || e.topic === topicFilter;
    return matchStyle && matchTopic;
  });

  const lightboxItem = lightboxId ? EXAMPLES.find((e) => e.id === lightboxId) ?? null : null;

  function openLightbox(id: string) {
    setLightboxId(id);
    setLightboxCutIndex(0);
  }
  function closeLightbox() {
    setLightboxId(null);
  }
  function prevCut() {
    if (!lightboxItem) return;
    setLightboxCutIndex((i) => Math.max(0, i - 1));
  }
  function nextCut() {
    if (!lightboxItem) return;
    setLightboxCutIndex((i) => Math.min(lightboxItem.cuts.length - 1, i + 1));
  }

  const artStyles: ArtStyle[] = ["전체", "감성손그림", "심플카툰", "수채화"];
  const topics: Topic[] = ["전체", "일상", "재테크", "힐링"];

  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      {/* 헤더 */}
      <header className="border-b border-[#E8F0EB] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            MyToon
          </Link>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#7CAF8A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#6a9e79]"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* 타이틀 */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">인스타툰 예시 갤러리</h1>
          <p className="mt-3 text-gray-500">
            MyToon으로 만든 다양한 스타일의 인스타툰을 구경해 보세요
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-8 flex flex-wrap gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">아트스타일</p>
            <div className="flex flex-wrap gap-2">
              {artStyles.map((s) => (
                <button
                  key={s}
                  onClick={() => setArtStyleFilter(s)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    artStyleFilter === s
                      ? "bg-[#7CAF8A] text-white"
                      : "border border-[#E8F0EB] bg-white text-gray-600 hover:bg-[#F0F7F2]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">주제</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopicFilter(t)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    topicFilter === t
                      ? "bg-[#7CAF8A] text-white"
                      : "border border-[#E8F0EB] bg-white text-gray-600 hover:bg-[#F0F7F2]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 그리드 */}
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <p className="text-4xl mb-3">🎨</p>
            <p>해당 조건의 예시가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => openLightbox(item.id)}
                className="group rounded-2xl border border-[#E8F0EB] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {/* 컷 미리보기 */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {item.cuts.slice(0, 4).map((cut, i) => (
                    <div key={i} className="h-20 rounded-lg overflow-hidden">
                      <CutPlaceholder
                        index={i}
                        artStyle={item.artStyle}
                        caption={cut.caption}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-[#E8F0EB] px-2.5 py-0.5 text-xs font-medium text-[#7CAF8A]">
                    {item.artStyle}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                    {item.topic}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-[#F0F7F2] p-10 text-center border border-[#E8F0EB]">
          <p className="text-lg font-semibold text-gray-900">
            나만의 인스타툰을 만들어 보세요
          </p>
          <p className="mt-2 text-sm text-gray-500">
            한 줄 설명만 입력하면 AI가 4컷 인스타툰을 완성해 드립니다
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-full bg-[#7CAF8A] px-8 py-3 text-sm font-semibold text-white hover:bg-[#6a9e79]"
          >
            무료로 시작하기 (크레딧 50개 지급)
          </Link>
        </div>
      </div>

      {/* 라이트박스 */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 */}
            <button
              onClick={closeLightbox}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="mb-1 flex gap-2">
              <span className="rounded-full bg-[#E8F0EB] px-2.5 py-0.5 text-xs font-medium text-[#7CAF8A]">
                {lightboxItem.artStyle}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                {lightboxItem.topic}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-gray-900">{lightboxItem.title}</h2>
            <p className="mt-1 text-xs text-gray-500">{lightboxItem.description}</p>

            {/* 현재 컷 */}
            <div className="mt-5 h-48 rounded-xl overflow-hidden">
              <CutPlaceholder
                index={lightboxCutIndex}
                artStyle={lightboxItem.artStyle}
                large
              />
            </div>
            <p className="mt-3 text-center text-sm text-gray-700">
              {lightboxItem.cuts[lightboxCutIndex].caption}
            </p>

            {/* 네비게이션 */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={prevCut}
                disabled={lightboxCutIndex === 0}
                className="rounded-full border border-[#E8F0EB] px-4 py-2 text-sm disabled:opacity-30 hover:bg-[#F0F7F2]"
              >
                ← 이전
              </button>
              <span className="text-xs text-gray-400">
                {lightboxCutIndex + 1} / {lightboxItem.cuts.length}
              </span>
              <button
                onClick={nextCut}
                disabled={lightboxCutIndex === lightboxItem.cuts.length - 1}
                className="rounded-full border border-[#E8F0EB] px-4 py-2 text-sm disabled:opacity-30 hover:bg-[#F0F7F2]"
              >
                다음 →
              </button>
            </div>

            {/* 컷 인디케이터 */}
            <div className="mt-3 flex justify-center gap-1.5">
              {lightboxItem.cuts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxCutIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === lightboxCutIndex ? "bg-[#7CAF8A]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <Link
              href="/signup"
              className="mt-5 block w-full rounded-full bg-[#7CAF8A] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#6a9e79]"
            >
              이렇게 만들어 보기
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
