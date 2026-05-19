import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <h1 className="text-4xl font-bold text-gray-900">MyToon</h1>
      <p className="mt-4 text-lg text-gray-500">
        한 줄로 만드는 나만의 인스타툰
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          시작하기
        </Link>
      </div>
    </main>
  );
}
