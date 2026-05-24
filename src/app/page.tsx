import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFFBF5] px-4">
      <h1 className="text-4xl font-bold text-gray-900">MyToon</h1>
      <p className="mt-4 text-lg text-gray-500">
        한 줄로 만드는 나만의 인스타툰
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-full bg-[#7CAF8A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6a9e79]"
        >
          무료로 시작하기
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          로그인
        </Link>
      </div>
      <div className="mt-6">
        <Link
          href="/examples"
          className="text-sm text-[#7CAF8A] underline hover:text-[#6a9e79]"
        >
          예시 더 보기 →
        </Link>
      </div>
    </main>
  );
}
