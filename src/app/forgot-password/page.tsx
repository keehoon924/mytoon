"use client";

import { useState } from "react";
import Link from "next/link";

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
      <CardShell>
        <div className="text-center">
          <div className="text-4xl">📬</div>
          <h1 className="font-heading mt-3 text-2xl text-ink">메일을 보냈어요</h1>
          <p className="mt-2 text-sm text-muted">가입된 이메일이라면 재설정 링크를 받게 됩니다. 메일함을 확인해주세요.</p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">로그인으로 돌아가기</Link>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <h1 className="font-heading text-2xl text-ink">비밀번호를 잊으셨나요?</h1>
      <p className="mt-1 text-sm text-muted">가입한 이메일로 재설정 링크를 보내드릴게요.</p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-ink">이메일</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-[var(--radius-md)] border border-line bg-background px-4 py-3 text-sm text-ink placeholder:text-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-[var(--focus-ring)]" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover disabled:opacity-50">
          {loading ? "전송 중..." : "재설정 메일 받기"}
        </button>
      </form>
      <p className="mt-5 text-center">
        <Link href="/login" className="text-sm text-muted hover:text-primary">로그인으로 돌아가기</Link>
      </p>
    </CardShell>
  );
}
