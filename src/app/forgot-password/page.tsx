"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900">이메일을 확인하세요</h1>
          <p className="mt-3 text-sm text-gray-500">
            입력하신 이메일로 재설정 링크를 보냈습니다.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-black underline">
            로그인으로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">가입한 이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "전송 중..." : "재설정 링크 보내기"}
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
