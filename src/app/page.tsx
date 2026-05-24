import Link from "next/link";
import HeroIllustration from "@/components/illustrations/HeroIllustration";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
        <div className="max-w-lg w-full">
          {/* Badge */}
          <span className="inline-block rounded-full bg-[#E8F0EB] px-3 py-1 text-xs font-medium text-[#7CAF8A] mb-6">
            베타 서비스 무료 이용 중
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            한 줄로 만드는
            <br />
            <span className="text-[#7CAF8A]">나만의 인스타툰</span>
          </h1>

          <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-sm mx-auto">
            일상 소재를 입력하면 AI가 웹툰 컷을 생성해 드려요.
            캐릭터부터 대사까지 모두 자동으로.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-[#7CAF8A] px-8 py-3 text-sm font-semibold text-white hover:bg-[#6A9E78] transition-colors shadow-sm"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#E8F0EB] bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-[#F0F7F2] transition-colors"
            >
              로그인
            </Link>
          </div>

          <div className="mt-4">
            <Link
              href="/examples"
              className="text-sm text-[#7CAF8A] hover:underline"
            >
              예시 작품 보기 →
            </Link>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="mt-10 w-full max-w-md">
          <HeroIllustration className="w-full h-auto drop-shadow-sm" />
        </div>
      </section>

      {/* Feature Section */}
      <section className="border-t border-[#E8F0EB] bg-white px-6 py-14">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">
            이렇게 쉬워요
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                emoji: "🎭",
                title: "캐릭터 만들기",
                desc: "사진 업로드 또는 텍스트로 내 캐릭터를 만들어요",
              },
              {
                step: "02",
                emoji: "✍️",
                title: "소재 입력",
                desc: "오늘 있었던 일, 하고 싶은 이야기를 한 줄로 써요",
              },
              {
                step: "03",
                emoji: "🚀",
                title: "AI 자동 생성",
                desc: "AI가 웹툰 컷과 대사를 자동으로 만들어 줘요",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#F0F7F2] flex items-center justify-center text-xl mb-3">
                  {item.emoji}
                </div>
                <div className="text-xs text-[#7CAF8A] font-semibold mb-1">{item.step}</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-[#F0F7F2] px-6 py-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          지금 바로 나만의 인스타툰을 만들어 보세요
        </h2>
        <p className="text-sm text-gray-500 mb-6">베타 기간 동안 50 크레딧 무료 제공</p>
        <Link
          href="/signup"
          className="inline-block rounded-full bg-[#7CAF8A] px-8 py-3 text-sm font-semibold text-white hover:bg-[#6A9E78] transition-colors"
        >
          무료로 시작하기
        </Link>
        <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">이용약관</Link>
          <Link href="/privacy" className="hover:text-gray-600">개인정보처리방침</Link>
          <Link href="/examples" className="hover:text-gray-600">예시 보기</Link>
        </div>
      </section>
    </main>
  );
}
