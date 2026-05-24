"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Sample = {
  id: number;
  title: string;
  emoji: string;
  style: "감성 손그림" | "심플 카툰" | "수채화";
  topic: "일상" | "재테크" | "힐링" | "직장" | "여행" | "취미";
  cuts: string[];
  grad: string;
};

const SAMPLES: Sample[] = [
  { id: 1, title: "월급쟁이 재테크 시작기", emoji: "📈", style: "감성 손그림", topic: "재테크", cuts: ["💸", "📊", "🏦", "📈"], grad: "from-[#f3e1b9] to-[#e3c489]" },
  { id: 2, title: "오늘도 출근길", emoji: "🚇", style: "심플 카툰", topic: "직장", cuts: ["⏰", "🚇", "☕", "💻"], grad: "from-[#e6ddcb] to-[#cfc2ad]" },
  { id: 3, title: "작은 습관이 만든 변화", emoji: "🌱", style: "수채화", topic: "일상", cuts: ["🌱", "📔", "🏃", "🌳"], grad: "from-[#dfe4d0] to-[#c2cca6]" },
  { id: 4, title: "혼자 떠난 제주", emoji: "🏝️", style: "수채화", topic: "여행", cuts: ["✈️", "🏝️", "🌅", "📸"], grad: "from-[#cfe0dd] to-[#aec9c4]" },
  { id: 5, title: "잘 자, 오늘도 수고했어", emoji: "🌙", style: "감성 손그림", topic: "힐링", cuts: ["🛏️", "🌙", "⭐", "😴"], grad: "from-[#e0dced] to-[#c6bedd]" },
  { id: 6, title: "주말 베이킹 도전", emoji: "🧁", style: "심플 카툰", topic: "취미", cuts: ["🥣", "🧈", "🔥", "🧁"], grad: "from-[#f0ddca] to-[#e3c3a8]" },
  { id: 7, title: "1,000만원 모으기", emoji: "💰", style: "감성 손그림", topic: "재테크", cuts: ["🐷", "💰", "📉", "🎯"], grad: "from-[#e9e0cc] to-[#cdd4b8]" },
  { id: 8, title: "퇴근 후 한 잔", emoji: "🍜", style: "수채화", topic: "일상", cuts: ["🌆", "🍜", "🍺", "🛋️"], grad: "from-[#f3e1b9] to-[#e0bd84]" },
  { id: 9, title: "마음이 지칠 때", emoji: "🍵", style: "감성 손그림", topic: "힐링", cuts: ["😮‍💨", "🍵", "🪴", "🌤️"], grad: "from-[#dfe4d0] to-[#c2cca6]" },
];

const STYLES = ["전체", "감성 손그림", "심플 카툰", "수채화"] as const;
const TOPICS = ["전체", "일상", "재테크", "힐링", "직장", "여행", "취미"] as const;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active ? "bg-primary text-white shadow-[var(--shadow-1)]" : "bg-surface text-muted ring-1 ring-line hover:text-primary"}`}>
      {children}
    </button>
  );
}

export default function ExamplesPage() {
  const [style, setStyle] = useState<(typeof STYLES)[number]>("전체");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("전체");
  const [open, setOpen] = useState<Sample | null>(null);

  const filtered = useMemo(
    () => SAMPLES.filter((s) => (style === "전체" || s.style === style) && (topic === "전체" || s.topic === topic)),
    [style, topic]
  );

  return (
    <main className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-primary text-lg shadow-[var(--shadow-2)]">🎨</span>
            <span className="font-heading text-2xl text-primary">MyToon</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-primary sm:inline-block">로그인</Link>
            <Link href="/signup" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">시작하기</Link>
          </div>
        </div>
      </header>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-accent-hover">Examples</span>
            <h1 className="font-heading mt-3 text-4xl text-ink sm:text-5xl">이런 인스타툰이 나와요</h1>
            <p className="mt-4 text-lg text-muted">우리 AI로 만든 샘플이에요. 클릭하면 컷을 자세히 볼 수 있어요.</p>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-subtle">스타일</span>
              {STYLES.map((s) => <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-subtle">주제</span>
              {TOPICS.map((t) => <Chip key={t} active={topic === t} onClick={() => setTopic(t)}>{t}</Chip>)}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-16 text-center text-muted">해당 조건의 샘플이 곧 추가돼요.</p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              {filtered.map((s) => (
                <button key={s.id} onClick={() => setOpen(s)} className="group text-left">
                  <div className={`relative grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br ${s.grad} ring-1 ring-white/40 transition group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-3)]`}>
                    <span className="text-6xl drop-shadow-sm">{s.emoji}</span>
                    <span className="absolute right-3 top-3 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-primary">{s.style}</span>
                  </div>
                  <p className="font-heading mt-2 text-sm text-ink">{s.title}</p>
                  <p className="text-xs text-subtle">{s.topic} · {s.cuts.length}컷</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-primary to-primary-active p-12 text-center text-white shadow-[var(--shadow-4)]">
          <h2 className="font-heading text-3xl sm:text-4xl">나도 만들어볼까요?</h2>
          <p className="mt-3 text-white/90">가입 즉시 100크레딧. 주제 한 문장이면 끝나요.</p>
          <Link href="/signup" className="mt-7 inline-block rounded-full bg-white px-9 py-3.5 text-base font-bold text-primary shadow-[var(--shadow-3)] transition hover:bg-surface-soft">무료로 시작하기 →</Link>
        </div>
      </section>

      <footer className="border-t border-line bg-surface/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <span className="font-heading text-lg text-primary">MyToon</span>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-primary">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary">개인정보처리방침</Link>
            <a href="mailto:edcrfv51@gmail.com" className="hover:text-primary">문의하기</a>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--overlay)] p-6" onClick={() => setOpen(null)}>
          <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-4)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl text-ink">{open.title}</h3>
                <p className="text-xs text-subtle">{open.style} · {open.topic}</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded-full p-1.5 text-muted hover:bg-surface-alt hover:text-ink">✕</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {open.cuts.map((c, i) => (
                <div key={i} className={`grid aspect-square place-items-center rounded-[var(--radius-md)] bg-gradient-to-br ${open.grad} text-4xl ring-1 ring-white/40`}>{c}</div>
              ))}
            </div>
            <Link href="/signup" className="mt-5 block rounded-full bg-primary py-3 text-center text-sm font-bold text-white transition hover:bg-primary-hover">이런 거 만들기 →</Link>
          </div>
        </div>
      )}
    </main>
  );
}
