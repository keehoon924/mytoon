"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function AuthSide() {
  return (
    <div className="hidden flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#dfe4d0] to-surface-alt p-12 text-center lg:flex">
      <div className="text-7xl drop-shadow-sm">🎨</div>
      <h2 className="font-heading text-3xl text-ink">한 줄로 만드는<br />감성 인스타툰</h2>
      <p className="text-muted">주제 한 문장이면 AI가 컷·대사·그림까지.</p>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "이메일 또는 비밀번호가 올바르지 않아요.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-primary text-lg shadow-[var(--shadow-2)]">🎨</span>
          <span className="font-heading text-2xl text-primary">MyToon</span>
        </Link>
        <h1 className="font-heading text-3xl text-ink">다시 오셨네요</h1>
        <p className="mt-1 text-sm text-muted">로그인하고 이어서 그려볼까요?</p>

        {verified && (
          <p className="mt-4 rounded-[var(--radius-md)] bg-[#eef2e4] px-3 py-2 text-sm text-success">
            이메일 인증이 완료됐어요. 로그인해주세요.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink">이메일</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink">비밀번호</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover disabled:opacity-50">
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-5 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-muted hover:text-primary">비밀번호 찾기</Link>
          <Link href="/signup" className="font-semibold text-primary hover:underline">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthSide />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
