import Link from "next/link";

/* 이모지 placeholder 타일 — 실제 이미지 도착 시 <img>로 교체 (id는 매핑용) */
function Slot({ id, ratio = "1/1", emoji = "🖼️", grad = "from-surface-alt to-[#d9c9a8]", className = "" }: { id?: string; ratio?: string; emoji?: string; grad?: string; className?: string }) {
  return (
    <div
      data-slot={id}
      className={`grid place-items-center overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br ${grad} ring-1 ring-white/40 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="text-5xl drop-shadow-sm">{emoji}</span>
    </div>
  );
}

/* 마스킹테이프 붙인 만화 액자 */
function TapedFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3 bg-accent/35 shadow-sm" />
      <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-3 shadow-[var(--shadow-3)]">
        {children}
      </div>
    </div>
  );
}

const topicChips = ["돈 관리 습관", "재테크 시작법", "부자 마인드셋", "투자 이야기", "절약 노하우"];
const heroPills = ["💬 컷 구성 자동 생성", "🗨️ 캐릭터 & 대사 생성", "🧩 템플릿 다양 제공", "⚡ 3분 만에 완성"];

const steps = [
  { step: "01", emoji: "✍️", title: "주제 입력", desc: "만들고 싶은 주제를 적어주세요" },
  { step: "02", emoji: "🧩", title: "템플릿 선택", desc: "마음에 드는 템플릿을 고르세요" },
  { step: "03", emoji: "🧑‍🎨", title: "캐릭터 선택", desc: "나에게 맞는 캐릭터를 고르세요" },
  { step: "04", emoji: "🎉", title: "완성", desc: "AI가 컷·대사까지 자동으로!" },
];

const templates = [
  { id: "기본 4컷", desc: "가장 기본적인 4컷 구성", emoji: "🗨️" },
  { id: "세로 스토리형", desc: "몰입감 있는 세로 구성", emoji: "📜" },
  { id: "말풍선 강조형", desc: "대화가 돋보이는 구성", emoji: "💬" },
  { id: "노트 정리형", desc: "정보 전달에 좋은 구성", emoji: "📔" },
];

const characters = [
  { name: "단순이", note: "심플한 일러스트", emoji: "👧" },
  { name: "지혜", note: "깔끔한 톤 스타일", emoji: "👩" },
  { name: "소담", note: "따뜻한 감성 스타일", emoji: "🧑‍🦱" },
  { name: "한우", note: "단정한 남자 캐릭터", emoji: "🧑" },
  { name: "마루", note: "귀여운 강아지", emoji: "🐶" },
  { name: "토리", note: "귀여운 토끼", emoji: "🐰" },
];

const samples = [
  { emoji: "☕", grad: "from-[#EFE7D6] to-[#d3c3a3]" },
  { emoji: "🌙", grad: "from-[#dfe4d0] to-[#c2cca6]" },
  { emoji: "🍜", grad: "from-[#f3e1b9] to-[#e3c489]" },
  { emoji: "🚇", grad: "from-[#e6ddcb] to-[#cfc2ad]" },
  { emoji: "🌷", grad: "from-[#ece2cf] to-[#d1c8aa]" },
  { emoji: "💰", grad: "from-[#e9e0cc] to-[#cdd4b8]" },
];

const features = [
  { icon: "🌱", title: "초보자도 쉽게", desc: "복잡한 기능 없이 누구나 3분 만에 완성" },
  { icon: "🪄", title: "AI 자동 구성", desc: "컷 구성·대사·캐릭터까지 AI가 알아서" },
  { icon: "🛍️", title: "상업적 이용 가능", desc: "블로그·인스타·유튜브 등 자유롭게 활용" },
  { icon: "✨", title: "고퀄리티 결과물", desc: "감성 일러스트로 전문가 같은 결과물" },
];

const pricing = [
  { credits: 100, price: "1,000", per: "10원 / 컷" },
  { credits: 500, price: "4,500", per: "9원 / 컷", popular: true },
  { credits: 1000, price: "8,000", per: "8원 / 컷" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-primary text-lg shadow-[var(--shadow-2)]">🎨</span>
            <div className="leading-tight">
              <div className="font-heading text-2xl text-primary">MyToon</div>
              <div className="-mt-1 text-[10px] text-subtle">AI 인스타툰 자동 생성</div>
            </div>
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold text-muted md:flex">
            <a href="#templates" className="hover:text-primary">템플릿</a>
            <a href="#characters" className="hover:text-primary">캐릭터</a>
            <a href="#features" className="hover:text-primary">기능</a>
            <a href="#pricing" className="hover:text-primary">요금제</a>
            <a href="#how" className="hover:text-primary">가이드</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-primary sm:inline-block">로그인</Link>
            <Link href="/signup" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">시작하기</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-14">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent-soft/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-32 h-96 w-96 rounded-full bg-[#dfe4d0]/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-hover ring-1 ring-accent/30">
              ✨ AI가 컷 구성부터 대사까지 한번에
            </span>
            <h1 className="font-heading mt-5 text-5xl leading-tight text-ink sm:text-6xl">
              주제만 입력하면<br />
              <span className="text-primary">감성 인스타툰</span> 완성
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              캐릭터, 대사, 컷 구성까지 AI가 알아서!<br />
              초보자도 쉽고 빠르게 나만의 인스타툰을 만들어보세요.
            </p>

            {/* 주제 입력 카드 → 가입으로 이어줌 (29.A) */}
            <form action="/signup" className="mt-7 rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-[var(--shadow-2)]">
              <label className="text-sm font-semibold text-ink">어떤 주제로 인스타툰을 만들고 싶으세요?</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input name="topic" placeholder="예) 10년 후 경제적 자유를 이루는 방법"
                  className="flex-1 rounded-full border border-line bg-background px-5 py-3 text-sm text-ink placeholder:text-subtle focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
                <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">🪄 자동 생성하기</button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-subtle">추천 주제</span>
                {topicChips.map((c) => (
                  <span key={c} className="rounded-full border border-line bg-background px-2.5 py-1 text-muted">{c}</span>
                ))}
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {heroPills.map((p) => (
                <span key={p} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-[var(--shadow-1)]">{p}</span>
              ))}
            </div>
          </div>

          {/* 히어로 메인 만화 (워시테이프 액자) */}
          <div className="relative mx-auto w-full max-w-md">
            <TapedFrame className="rotate-1">
              <div className="grid grid-cols-2 gap-2 rounded-[var(--radius-lg)] bg-surface-soft p-2" data-slot="hero-comic.png">
                {["✍️", "📈", "📚", "🎉"].map((e, i) => (
                  <div key={i} className="grid aspect-square place-items-center rounded-[var(--radius-md)] bg-gradient-to-br from-surface-alt to-[#d9c9a8] text-4xl ring-1 ring-white/40">{e}</div>
                ))}
              </div>
            </TapedFrame>
            <div className="absolute -bottom-4 -right-2 rotate-3 rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2 text-xs font-semibold text-muted shadow-[var(--shadow-2)]">
              ♡ AI가 만든<br />나만의 인스타툰
            </div>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-surface/70 p-10 ring-1 ring-line">
          <h2 className="font-heading text-center text-3xl text-ink sm:text-4xl">인스타툰 제작, 단 <span className="text-primary">4단계</span>면 충분해요!</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="rounded-[var(--radius-xl)] border border-line bg-background p-6 text-center shadow-[var(--shadow-1)]">
                <div className="text-4xl">{s.emoji}</div>
                <h3 className="font-heading mt-3 text-lg text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-2xl text-ink">다양한 템플릿</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {templates.map((t, i) => (
              <div key={t.id}>
                <Slot id={`template-${i + 1}.png`} ratio="4/5" emoji={t.emoji} />
                <p className="font-heading mt-2 text-sm text-ink">{t.id}</p>
                <p className="text-xs text-subtle">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Characters */}
      <section id="characters" className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-2xl text-ink">캐릭터</h2>
          <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {characters.map((c, i) => (
              <div key={c.name} className="text-center">
                <Slot id={`character-${i + 1}.png`} ratio="1/1" emoji={c.emoji} grad="from-surface-soft to-surface-alt" className="rounded-[var(--radius-xl)]" />
                <p className="font-heading mt-2 text-sm text-ink">{c.name}</p>
                <p className="text-[11px] text-subtle">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <h2 className="font-heading text-2xl text-ink">이런 인스타툰이 나와요</h2>
            <span className="text-sm text-muted">우리 AI가 만든 컷들</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {samples.map((s, i) => (
              <Slot key={i} id={`sample-${i + 1}.png`} ratio="1/1" emoji={s.emoji} grad={s.grad} className="rounded-[var(--radius-xl)]" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA with group illustration */}
      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-6 rounded-[2rem] bg-surface-alt/70 p-10 ring-1 ring-line md:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl text-ink">나만의 캐릭터로<br />브랜드 인스타툰을 만들어보세요</h2>
            <p className="mt-3 text-muted">AI 캐릭터로 일관된 콘텐츠를 쉽고 빠르게!</p>
            <Link href="/signup" className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">캐릭터 만들러 가기 →</Link>
          </div>
          <Slot id="cta-group.png" ratio="16/10" emoji="🧑‍💻" grad="from-surface to-surface-alt" className="rounded-[var(--radius-xl)]" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-accent-soft text-xl">{f.icon}</div>
              <div>
                <h3 className="font-heading text-base text-ink">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-center text-3xl text-ink sm:text-4xl">필요한 만큼만 충전</h2>
          <p className="mt-3 text-center text-muted">컷 1개 생성에 1크레딧. 가입하면 100크레딧 무료로 드려요.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
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

      {/* Footer */}
      <footer className="border-t border-line bg-surface/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg text-primary">MyToon</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-primary">이용약관</Link>
            <Link href="/privacy" className="hover:text-primary">개인정보처리방침</Link>
            <a href="mailto:edcrfv51@gmail.com" className="hover:text-primary">문의하기</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
