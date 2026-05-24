"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-line bg-surface p-8 shadow-[var(--shadow-2)]">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-primary text-base shadow-[var(--shadow-1)]">🎨</span>
          <span className="font-heading text-xl text-primary">MyToon</span>
        </Link>
        {children}
      </div>
    </main>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "링크가 만료됐거나 올바르지 않아요.");
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <CardShell>
        <div className="text-center">
          <div className="text-4xl">⚠️</div>
          <h1 className="font-heading mt-3 text-2xl text-ink">링크가 올바르지 않아요</h1>
          <p className="mt-2 text-sm text-muted">재설정 링크가 유효하지 않습니다. 다시 요청해주세요.</p>
          <Link href="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">재설정 메일 다시 받기</Link>
        </div>
      </CardShell>
    );
  }

  if (done) {
    return (
      <CardShell>
        <div className="text-center">
          <div className="text-4xl">🎉</div>
          <h1 className="font-heading mt-3 text-2xl text-ink">비밀번호 변경 완료</h1>
          <p className="mt-2 text-sm text-muted">새 비밀번호로 로그인해주세요.</p>
          <Link href="/login" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">로그인하러 가기</Link>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <h1 className="font-heading text-2xl text-ink">새 비밀번호 설정</h1>
      <p className="mt-1 text-sm text-muted">새로 사용할 비밀번호를 입력해주세요.</p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-ink">새 비밀번호 <span className="font-normal text-subtle">(8자 이상)</span></label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-[var(--radius-md)] border border-line bg-background px-4 py-3 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover disabled:opacity-50">
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </CardShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
