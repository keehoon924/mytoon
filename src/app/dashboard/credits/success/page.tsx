"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const sp = useSearchParams();
  const [credits, setCredits] = useState<number | null>(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      const paymentKey = sp.get("paymentKey");
      const orderId = sp.get("orderId");
      const amountStr = sp.get("amount");
      if (!paymentKey || !orderId || !amountStr) {
        if (!cancelled) setErrMsg("결제 정보가 누락되었습니다.");
        return;
      }
      try {
        const r = await fetch("/api/credits/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amountStr) }),
        });
        const data = await r.json();
        if (cancelled) return;
        if (r.ok) setCredits(data.credits);
        else setErrMsg(data.error ?? "결제 승인 실패");
      } catch (e) {
        if (cancelled) return;
        setErrMsg((e as Error).message);
      }
    })();
    return () => { cancelled = true; };
  }, [sp]);

  const loading = credits === null && errMsg === "";
  const ok = credits !== null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center">
        {loading && <p className="text-gray-500">결제 승인 처리 중...</p>}
        {ok && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">충전 완료</h1>
            <p className="text-gray-600 mb-6">{credits?.toLocaleString()} 크레딧이 적립되었습니다.</p>
            <div className="flex gap-2 justify-center">
              <Link href="/dashboard/credits" className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">충전 페이지</Link>
              <Link href="/dashboard" className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">내 서랍으로</Link>
            </div>
          </>
        )}
        {errMsg && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
            <p className="text-red-500 mb-6">{errMsg}</p>
            <Link href="/dashboard/credits" className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">충전 페이지로</Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">결제 승인 처리 중...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
