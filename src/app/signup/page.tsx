"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("이용약관 및 개인정보처리방침에 동의해 주세요.");
      return;
    }
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFBF5] px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900">이메일을 확인하세요</h1>
          <p className="mt-3 text-sm text-gray-500">
            인증 링크를 <strong>{email}</strong> 로 보냈습니다.
            <br />
            링크를 클릭해 인증을 완료하면 로그인할 수 있습니다.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-[#7CAF8A] underline">
            로그인으로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFBF5] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900">시작하기</h1>
        <p className="mt-1 text-sm text-gray-500">가입 즉시 무료 크레딧 50개 지급</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호 (8자 이상)</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
            />
          </div>

          {/* 약관 동의 */}
          <div className="flex items-start gap-2">
            <input
              id="agree-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#7CAF8A]"
            />
            <label htmlFor="agree-terms" className="text-sm text-gray-600 leading-snug">
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#7CAF8A] underline"
              >
                이용약관
              </Link>
              {" "}및{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#7CAF8A] underline"
              >
                개인정보처리방침
              </Link>
              에 동의합니다 <span className="text-red-400">(필수)</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#7CAF8A] py-2.5 text-sm font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-50"
          >
            {loading ? "처리 중..." : "가입하기"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-medium text-[#7CAF8A] underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
