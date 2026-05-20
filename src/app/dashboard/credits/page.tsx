"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CreditPackage } from "@/lib/creditPackages";

type Order = {
  id: string; packageId: string; credits: number; amountKrw: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELED"; createdAt: string;
};

const TOSS_SDK_URL = "https://js.tosspayments.com/v1/payment";

type TossPayments = {
  requestPayment: (
    method: string,
    options: {
      amount: number;
      orderId: string;
      orderName: string;
      successUrl: string;
      failUrl: string;
    },
  ) => Promise<void>;
};
type TossPaymentsCtor = (clientKey: string) => TossPayments;

declare global {
  interface Window {
    TossPayments?: TossPaymentsCtor;
  }
}

async function loadToss(): Promise<TossPaymentsCtor> {
  if (typeof window === "undefined") throw new Error("client only");
  if (window.TossPayments) return window.TossPayments;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TOSS_SDK_URL;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Toss SDK 로드 실패"));
    document.head.appendChild(s);
  });
  if (!window.TossPayments) throw new Error("Toss SDK 미준비");
  return window.TossPayments;
}

function statusLabel(s: Order["status"]) {
  switch (s) {
    case "PAID": return "완료";
    case "PENDING": return "대기";
    case "FAILED": return "실패";
    case "CANCELED": return "취소";
  }
}

function statusColor(s: Order["status"]) {
  switch (s) {
    case "PAID": return "text-green-600";
    case "PENDING": return "text-gray-400";
    case "FAILED": return "text-red-500";
    case "CANCELED": return "text-gray-400";
  }
}

export default function CreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [pkgRes, ordRes, balRes] = await Promise.all([
        fetch("/api/credits/packages"),
        fetch("/api/credits/orders"),
        fetch("/api/credits"),
      ]);
      if (cancelled) return;
      if (pkgRes.ok) setPackages((await pkgRes.json()).packages);
      if (ordRes.ok) setOrders((await ordRes.json()).orders);
      if (balRes.ok) {
        const data = await balRes.json();
        setBalance(data.isUnlimited ? null : data.balance);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleBuy(pkg: CreditPackage) {
    setError(""); setBusy(true);
    try {
      const purchaseRes = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const purchaseData = await purchaseRes.json();
      if (!purchaseRes.ok) throw new Error(purchaseData.error ?? "주문 생성 실패");

      const Toss = await loadToss();
      const toss = Toss(clientKey);
      const origin = window.location.origin;
      await toss.requestPayment("카드", {
        amount: purchaseData.order.amountKrw,
        orderId: purchaseData.order.tossOrderId,
        orderName: purchaseData.order.orderName,
        successUrl: `${origin}/dashboard/credits/success`,
        failUrl: `${origin}/dashboard/credits/fail`,
      });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-gray-500 hover:text-black text-sm">← 내 서랍</Link>
        <h1 className="font-semibold text-gray-900">크레딧 충전</h1>
        <span className="text-sm text-gray-600">
          {balance === null ? "관리자(무제한)" : <>현재 <strong className="text-black">{balance}</strong>개</>}
        </span>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-sm text-gray-500 mb-4">
          AI 생성 1컷당 1크레딧이 소모됩니다. 결제는 토스페이먼츠로 처리됩니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {packages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleBuy(p)}
              disabled={busy}
              className="rounded-2xl border bg-white p-5 text-left hover:border-black transition-colors disabled:opacity-50"
            >
              <p className="text-xs text-gray-500">{p.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{p.credits.toLocaleString()} <span className="text-base font-medium text-gray-500">크레딧</span></p>
              <p className="mt-2 text-sm text-gray-700">{p.amountKrw.toLocaleString()}원</p>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <section className="rounded-xl border bg-white">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">결제 이력</h2>
          </div>
          <div className="divide-y">
            {orders.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400">결제 이력이 없습니다.</p>
            )}
            {orders.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-900">{o.credits.toLocaleString()} 크레딧</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString("ko-KR", { hour12: false })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">{o.amountKrw.toLocaleString()}원</span>
                  <span className={statusColor(o.status)}>{statusLabel(o.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
