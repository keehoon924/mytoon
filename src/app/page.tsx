import Link from "next/link";

const examples = [
  { emoji: "☕", bubble: "오늘도 출근...", gradient: "from-pink-200 via-rose-200 to-orange-200" },
  { emoji: "🌙", bubble: "잘 자!", gradient: "from-indigo-200 via-purple-200 to-pink-200" },
  { emoji: "🍜", bubble: "이거 진짜 맛있어", gradient: "from-amber-200 via-orange-200 to-rose-200" },
  { emoji: "🚇", bubble: "지하철 또 늦었네", gradient: "from-sky-200 via-cyan-200 to-emerald-200" },
  { emoji: "🐱", bubble: "야옹~", gradient: "from-violet-200 via-fuchsia-200 to-pink-200" },
  { emoji: "🎂", bubble: "생일 축하해!", gradient: "from-yellow-200 via-pink-200 to-rose-200" },
];

const features = [
  {
    icon: "✨",
    title: "한 줄이면 끝",
    desc: "줄거리 한 문장만 적으면 AI가 컷별로 그림과 대사까지 만들어줘요.",
  },
  {
    icon: "🧑‍🎨",
    title: "내 캐릭터 저장",
    desc: "사진 한 장이나 설명만으로 캐릭터를 등록하면 다음 작품에서 바로 불러와요.",
  },
  {
    icon: "🖌️",
    title: "컷별 미세 편집",
    desc: "브러시·필터·말풍선·인페인팅까지. 마음에 안 드는 부분만 다시 그려요.",
  },
  {
    icon: "📦",
    title: "한 번에 내보내기",
    desc: "PNG·JPG 개별 다운로드부터 ZIP 묶음까지. 인스타에 바로 올려보세요.",
  },
];

const pricing = [
  { credits: 100, price: "1,000", per: "10원 / 컷" },
  { credits: 500, price: "4,500", per: "9원 / 컷", popular: true },
  { credits: 1000, price: "8,000", per: "8원 / 컷" },
];

function Panel({
  emoji,
  bubble,
  gradient,
  className = "",
}: {
  emoji: string;
  bubble: string;
  gradient: string;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[4/5] rounded-3xl bg-gradient-to-br ${gradient} p-5 shadow-[0_20px_50px_-10px_rgba(244,114,182,0.35)] ring-1 ring-white/60 ${className}`}
    >
      <div className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-pink-500">
        MyToon
      </div>
      <div className="flex h-full items-center justify-center text-7xl drop-shadow-md">
        {emoji}
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-md">
        {bubble}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff7f3] text-gray-900">
      <header className="sticky top-0 z-30 border-b border-pink-100/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-lg shadow-md">
              🎨
            </span>
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-xl font-extrabold text-transparent">
              MyToon
            </span>
          </Link>
          <nav className="hidden gap-7 text-sm font-semibold text-gray-600 sm:flex">
            <a href="#how" className="hover:text-pink-500">사용법</a>
            <a href="#gallery" className="hover:text-pink-500">예시</a>
            <a href="#features" className="hover:text-pink-500">기능</a>
            <a href="#pricing" className="hover:text-pink-500">요금</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:text-pink-500 sm:inline-block"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:scale-105"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pt-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-pink-600 shadow-sm ring-1 ring-pink-200">
              <span>🎁</span> 가입 즉시 무료 크레딧 50개
            </span>
            <h1 className="mt-5 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                한 줄로 만드는
              </span>
              <br />
              나만의 <span className="text-gray-900">인스타툰</span>
              <span className="ml-2 inline-block animate-bounce">✨</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
              줄거리 한 문장이면 AI가 컷별로 그림과 대사를 만들어줘요.
              <br className="hidden sm:block" />
              편집하고, 캐릭터 저장하고, 인스타에 바로 올리세요.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/signup"
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-pink-200 transition hover:scale-105"
              >
                무료로 시작하기 →
              </Link>
              <a
                href="#gallery"
                className="rounded-full bg-white/80 px-8 py-4 text-base font-bold text-gray-800 ring-1 ring-gray-200 transition hover:bg-white"
              >
                예시 보기
              </a>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 lg:justify-start">
              <span className="flex -space-x-2">
                {["🐱", "🐰", "🦊", "🐻"].map((e, i) => (
                  <span
                    key={i}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white text-base shadow ring-2 ring-pink-100"
                  >
                    {e}
                  </span>
                ))}
              </span>
              <span>이미 1,200명이 그리고 있어요</span>
            </div>
          </div>

          <div className="relative mx-auto h-[480px] w-full max-w-md lg:h-[520px]">
            <Panel
              {...examples[0]}
              className="animate-float absolute left-0 top-4 w-44 -rotate-6 sm:w-52"
            />
            <Panel
              {...examples[1]}
              className="animate-float-delayed absolute right-0 top-0 w-44 rotate-6 sm:w-52"
            />
            <Panel
              {...examples[3]}
              className="animate-float-delayed-2 absolute bottom-0 left-1/2 w-48 -translate-x-1/2 rotate-2 sm:w-56"
            />
          </div>
        </div>
      </section>

      <section id="how" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-pink-500">
              How it works
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              3단계면 끝나요
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              복잡한 그림 도구도, AI 프롬프트 공부도 필요 없어요.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "한 줄 입력",
                desc: "오늘 있었던 일 한 문장이면 충분해요.",
                color: "from-pink-400 to-rose-500",
                emoji: "✍️",
              },
              {
                step: "02",
                title: "AI가 자동 생성",
                desc: "컷별 그림과 말풍선 대사를 알아서 만들어요.",
                color: "from-purple-400 to-indigo-500",
                emoji: "🪄",
              },
              {
                step: "03",
                title: "편집하고 공유",
                desc: "마음에 안 들면 그 컷만 다시. 바로 다운로드.",
                color: "from-emerald-400 to-teal-500",
                emoji: "🚀",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="group relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-pink-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`absolute -top-4 left-8 rounded-full bg-gradient-to-r ${s.color} px-3 py-1 text-xs font-black text-white shadow-lg`}
                >
                  STEP {s.step}
                </div>
                <div className="text-5xl">{s.emoji}</div>
                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-purple-500">
              Examples
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              이런 컷이 나와요
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              실제로 만들어진 컷들이에요.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {examples.map((ex, i) => (
              <Panel key={i} {...ex} className="transition hover:-translate-y-1" />
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-500">
              Features
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              이런 게 다 돼요
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-rose-500">
              Pricing
            </span>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              필요한 만큼만 충전
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              컷 1개 생성에 1크레딧. 가입하면 50크레딧 무료로 드려요.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pricing.map((p) => (
              <div
                key={p.credits}
                className={`relative rounded-3xl p-8 transition ${
                  p.popular
                    ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-2xl shadow-pink-200 md:-translate-y-4"
                    : "bg-white shadow-sm ring-1 ring-gray-100 hover:-translate-y-1 hover:shadow-xl"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-300 px-4 py-1 text-xs font-black text-purple-900 shadow-md">
                    🔥 가장 인기
                  </span>
                )}
                <div className="text-3xl font-black">{p.credits.toLocaleString()}</div>
                <div className={`text-sm ${p.popular ? "text-white/80" : "text-gray-500"}`}>
                  크레딧
                </div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black">₩{p.price}</span>
                </div>
                <div className={`mt-1 text-sm ${p.popular ? "text-white/80" : "text-gray-500"}`}>
                  {p.per}
                </div>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-full py-3 text-center font-bold transition ${
                    p.popular
                      ? "bg-white text-purple-700 hover:scale-105"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  시작하기
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 p-12 text-center text-white shadow-2xl sm:p-16">
          <div className="text-5xl">🎨</div>
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">
            오늘 있었던 일,
            <br />한 줄로 그려볼래요?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            가입 즉시 50크레딧. 카드 등록도 필요 없어요.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-black text-purple-700 shadow-xl transition hover:scale-105"
          >
            무료로 시작하기 →
          </Link>
        </div>
      </section>

      <footer className="border-t border-pink-100 bg-white/50 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 text-sm">
              🎨
            </span>
            <span className="font-bold text-gray-700">MyToon</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-pink-500">이용약관</a>
            <a href="#" className="hover:text-pink-500">개인정보처리방침</a>
            <a href="#" className="hover:text-pink-500">문의</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
