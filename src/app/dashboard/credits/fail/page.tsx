"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function FailContent() {
  const sp = useSearchParams();
  const code = sp.get("code") ?? "UNKNOWN";
  const message = sp.get("message") ?? "결제가 취소되었거나 실패했습니다.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-600 mb-1">{message}</p>
        <p className="text-xs text-gray-400 mb-6">코드: {code}</p>
        <Link href="/dashboard/credits" className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">
          충전 페이지로
        </Link>
      </div>
    </main>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">불러오는 중...</div>}>
      <FailContent />
    </Suspense>
  );
}
