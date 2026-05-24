import Link from "next/link";

const samples = [
  { emoji: "☕", bubble: "오늘도 출근...", grad: "from-[#EFE7D6] to-[#d3c3a3]" },
  { emoji: "🌙", bubble: "잘 자!", grad: "from-[#dfe4d0] to-[#c2cca6]" },
  { emoji: "🍜", bubble: "이거 진짜 맛있어", grad: "from-[#f3e1b9] to-[#e3c489]" },
  { emoji: "🚇", bubble: "지하철 또 늦었네", grad: "from-[#e6ddcb] to-[#cfc2ad]" },
  { emoji: "🐱", bubble: "야옹~", grad: "from-[#ece2cf] to-[#d1c8aa]" },
  { emoji: "🌷", bubble: "봄이 왔어", grad: "from-[#e9e0cc] to-[#cdd4b8]" },
];

const steps = [
  { step: "01", emoji: "✍️", title: "주제 입력", desc: "오늘 있었던 일 한 문장이면 충분해요." },
  { step: "02", emoji: "🧩", title: "템플릿 선택", desc: "구도와 아트 스타일을 고르면 끝." },
  { step: "03", emoji: "🧑‍🎨", title: "캐릭터 선택", desc: "내 캐릭터를 등록하거나 기본 캐릭터로." },
  { step: "04", emoji: "🎉", title: "완성", desc: "AI가 컷·대사·그림까지 자동으로." },
];

const features = [
  { icon: "🧑‍🎨", title: "캐릭터 일관성", desc: "한 번 등록한 캐릭터가 모든 컷에 똑같이 등장해요." },
  { icon: "🖌️", title: "풀 편집기", desc: "말풍선·브러시·필터·레이어까지 자유롭게 다듬어요." },
  { icon: "💬", title: "감성 말풍선·폰트", desc: "다양한 말풍선 모양과 한글 폰트로 분위기를 살려요." },
  { icon: "📦", title: "한 번에 내보내기", desc: "PNG·JPG·ZIP으로 인스타에 바로 올려요." },
];

const pricing = [
  { credits: 100, price: "1,000", per: "10원 / 컷" },
  { credits: 500, price: "4,500", per: "9원 / 컷", popular: true },
  { credits: 1000, price: "8,000", per: "8원 / 컷" },
];

function Panel({ emoji, bubble, grad, className = "" }: { emoji: string; bubble: string; grad: string; className?: string }) {
  return (
    <div className={`relative aspect-[4/5] rounded-[var(--radius-xl)] bg-gradient-to-br ${grad} p-5 shadow-[var(--shadow-3)] ring-1 ring-white/50 ${className}`}>
      <div className="absolute right-3 top-3 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-primary">MyToon</div>
      <div className="flex h-full items-center justify-center text-7xl drop-shadow-sm">{emoji}</div>
      <div className="absolute bottom-4 left-4 right-4 rounded-[var(--radius-lg)] bg-white px-4 py-2 text-sm font-semibold text-ink shadow-[var(--shadow-2)]">{bubble}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-primary text-lg shadow-[var(--shadow-2)]">🎨</span>
            <span className="font-heading text-2xl text-primary">MyToon</span>
          </Link>
          <nav className="hidden gap-7 text-sm font-semibold text-muted sm:flex">
            <a href="#how" className="hover:text-primary">사용법</a>
            <a href="#gallery" className="hover:text-primary">예시</a>
            <a href="#features" className="hover:text-primary">기능</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-primary sm:inline-block">로그인</Link>
            <Link href="/signup" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">시작하기</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent-soft/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-[#dfe4d0]/60 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-hover shadow-[var(--shadow-1)] ring-1 ring-accent/30">
              🎁 가입 즉시 무료 크레딧 100개
            </span>
            <h1 className="font-heading mt-5 text-5xl leading-tight text-ink sm:text-6xl lg:text-7xl">
              한 줄로 만드는<br />
              <span className="text-primary">감성 인스타툰</span>
              <span className="ml-2 inline-block animate-bounce">✨</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              주제 한 문장이면 AI가 컷·대사·그림까지 만들어줘요.<br className="hidden sm:block" />
              편집하고, 캐릭터 저장하고, 인스타에 바로 올리세요.
            </p>
            {/* 히어로 주제 입력창 → 가입으로 이어줌 (29.A) */}
            <form action="/signup" className="mt-7 flex flex-col gap-2 sm:flex-row">
              <input name="topic" placeholder="예) 10년 후 경제적 자유를 이루는 방법"
                className="flex-1 rounded-full border border-line bg-surface px-5 py-3.5 text-sm text-ink placeholder:text-subtle focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
              <button type="submit" className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">
                자동 생성하기 →
              </button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted lg:justify-start">
              <span className="flex -space-x-2">
                {["🐱", "🐰", "🦊", "🐻"].map((e, i) => (
                  <span key={i} className="grid h-8 w-8 place-items-center rounded-full bg-surface text-base shadow-[var(--shadow-1)] ring-2 ring-line">{e}</span>
                ))}
              </span>
              <span>이미 1,200명이 그리고 있어요</span>
            </div>
          </div>
          <div className="relative mx-auto h-[480px] w-full max-w-md lg:h-[520px]">
            <Panel {...samples[0]} className="animate-float absolute left-0 top-4 w-44 -rotate-6 sm:w-52" />
            <Panel {...samples[1]} className="animate-float-delayed absolute right-0 top-0 w-44 rotate-6 sm:w-52" />
            <Panel {...samples[3]} className="animate-float-delayed-2 absolute bottom-0 left-1/2 w-48 -translate-x-1/2 rotate-2 sm:w-56" />
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">How it works</span>
            <h2 className="font-heading mt-3 text-4xl text-ink sm:text-5xl">4단계면 끝나요</h2>
            <p className="mt-4 text-lg text-muted">복잡한 그림 도구도, AI 공부도 필요 없어요.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-[var(--radius-xl)] bg-surface p-7 shadow-[var(--shadow-1)] ring-1 ring-line transition hover:-translate-y-1 hover:shadow-[var(--shadow-3)]">
                <div className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">STEP {s.step}</div>
                <div className="text-4xl">{s.emoji}</div>
                <h3 className="font-heading mt-4 text-xl text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-accent-hover">Examples</span>
            <h2 className="font-heading mt-3 text-4xl text-ink sm:text-5xl">이런 인스타툰이 나와요</h2>
            <p className="mt-4 text-lg text-muted">실제로 우리 AI가 만든 컷들이에요.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {samples.map((s, i) => <Panel key={i} {...s} className="transition hover:-translate-y-1" />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-success">Features</span>
            <h2 className="font-heading mt-3 text-4xl text-ink sm:text-5xl">이런 게 다 돼요</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-1)] ring-1 ring-line transition hover:-translate-y-1 hover:shadow-[var(--shadow-2)]">
                <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-lg)] bg-accent-soft text-2xl">{f.icon}</div>
                <h3 className="font-heading mt-4 text-lg text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-danger">Pricing</span>
            <h2 className="font-heading mt-3 text-4xl text-ink sm:text-5xl">필요한 만큼만 충전</h2>
            <p className="mt-4 text-lg text-muted">컷 1개 생성에 1크레딧. 가입하면 100크레딧 무료로 드려요.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pricing.map((p) => (
              <div key={p.credits} className={`relative rounded-[var(--radius-xl)] p-8 transition ${p.popular ? "bg-primary text-white shadow-[var(--shadow-4)] md:-translate-y-4" : "bg-surface text-ink shadow-[var(--shadow-1)] ring-1 ring-line hover:-translate-y-1 hover:shadow-[var(--shadow-3)]"}`}>
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-white shadow-[var(--shadow-2)]">🔥 가장 인기</span>}
                <div className="font-heading text-3xl">{p.credits.toLocaleString()}</div>
                <div className={`text-sm ${p.popular ? "text-white/80" : "text-muted"}`}>크레딧</div>
                <div className="mt-6 font-heading text-4xl">₩{p.price}</div>
                <div className={`mt-1 text-sm ${p.popular ? "text-white/80" : "text-muted"}`}>{p.per}</div>
                <Link href="/signup" className={`mt-8 block rounded-full py-3 text-center font-bold transition ${p.popular ? "bg-white text-primary hover:bg-surface-soft" : "bg-primary text-white hover:bg-primary-hover"}`}>시작하기</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-active p-12 text-center text-white shadow-[var(--shadow-4)] sm:p-16">
          <div className="text-5xl">🎨</div>
          <h2 className="font-heading mt-4 text-3xl sm:text-5xl">오늘 있었던 일,<br />한 줄로 그려볼래요?</h2>
          <p className="mt-4 text-lg text-white/90">가입 즉시 100크레딧. 카드 등록도 필요 없어요.</p>
          <Link href="/signup" className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-primary shadow-[var(--shadow-3)] transition hover:bg-surface-soft">무료로 시작하기 →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-surface/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-primary text-sm">🎨</span>
            <span className="font-heading text-ink">MyToon</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-primary">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary">개인정보처리방침</Link>
            <a href="mailto:edcrfv51@gmail.com" className="hover:text-primary">문의</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
