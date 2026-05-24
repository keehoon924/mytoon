"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const topic = params.get("topic") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) return;
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
      setError(data.error ?? "가입에 실패했어요.");
      return;
    }
    // 30.A: 인증 전에도 사용 가능 → 바로 앱으로 (주제 있으면 새 작품으로 이어줌 — 29.A)
    router.push(topic ? `/dashboard/new?topic=${encodeURIComponent(topic)}` : "/dashboard");
  }

  return (
    <div className="flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-primary text-lg shadow-[var(--shadow-2)]">🎨</span>
          <span className="font-heading text-2xl text-primary">MyToon</span>
        </Link>
        <h1 className="font-heading text-3xl text-ink">시작하기</h1>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent-hover ring-1 ring-accent/30">
          🎁 가입 즉시 무료 크레딧 100개
        </span>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink">이메일</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink">비밀번호 <span className="font-normal text-subtle">(8자 이상)</span></label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
          </div>

          <label className="flex items-start gap-2 text-xs text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[var(--primary)]" />
            <span>
              <Link href="/terms" target="_blank" className="text-primary underline">이용약관</Link> 및{" "}
              <Link href="/privacy" target="_blank" className="text-primary underline">개인정보처리방침</Link>에 동의합니다.
            </span>
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading || !agree}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover disabled:opacity-50">
            {loading ? "처리 중..." : "무료로 시작하기"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col items-center justify-center gap-4 bg-gradient-to-br from-accent-soft to-surface-alt p-12 text-center lg:flex">
        <div className="text-7xl drop-shadow-sm">✨</div>
        <h2 className="font-heading text-3xl text-ink">오늘 있었던 일,<br />한 줄로 그려볼까요?</h2>
        <p className="text-muted">가입 즉시 100크레딧. 카드 등록도 필요 없어요.</p>
      </div>
      <Suspense>
        <SignupForm />
      </Suspense>
    </main>
  );
}
