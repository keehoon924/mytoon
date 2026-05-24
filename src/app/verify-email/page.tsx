"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-line bg-surface p-8 text-center shadow-[var(--shadow-2)]">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-primary text-base shadow-[var(--shadow-1)]">🎨</span>
          <span className="font-heading text-xl text-primary">MyToon</span>
        </Link>
        {children}
      </div>
    </main>
  );
}

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setStatus("fail");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => { if (!cancelled) setStatus(r.ok ? "ok" : "fail"); })
      .catch(() => { if (!cancelled) setStatus("fail"); });
    return () => { cancelled = true; };
  }, [token]);

  if (status === "loading") {
    return (
      <CardShell>
        <div className="text-4xl animate-pulse">⏳</div>
        <p className="mt-3 text-sm text-muted">이메일 인증 처리 중이에요...</p>
      </CardShell>
    );
  }

  if (status === "ok") {
    return (
      <CardShell>
        <div className="text-5xl">🎉</div>
        <h1 className="font-heading mt-3 text-2xl text-ink">인증 완료!</h1>
        <p className="mt-2 text-sm text-muted">이메일 인증이 끝났어요. 이제 마음껏 그려볼까요?</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-2)] transition hover:bg-primary-hover">내 서랍으로 가기</Link>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <div className="text-5xl">😢</div>
      <h1 className="font-heading mt-3 text-2xl text-ink">링크가 만료됐어요</h1>
      <p className="mt-2 text-sm text-muted">인증 링크가 유효하지 않거나 만료됐어요. 로그인 후 설정에서 다시 받을 수 있어요.</p>
      <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">로그인하러 가기</Link>
    </CardShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
