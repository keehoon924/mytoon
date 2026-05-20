"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { reasonLabel, statusLabel, statusColor } from "@/lib/reports";

type Report = {
  id: string;
  targetType: "PROJECT" | "CHARACTER";
  targetId: string;
  reason: string;
  detail: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
};

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reports").then((r) => r.json()).then((data) => {
      if (!cancelled && data.reports) setReports(data.reports);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-gray-500 hover:text-black text-sm">← 내 서랍</Link>
        <h1 className="font-semibold text-gray-900">내 신고</h1>
        <span className="w-12" />
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="rounded-xl border bg-white divide-y">
          {reports.length === 0 && (
            <p className="px-3 py-6 text-center text-gray-400 text-sm">신고 내역이 없습니다.</p>
          )}
          {reports.map((r) => (
            <div key={r.id} className="p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">
                  {r.targetType === "PROJECT" ? "작품" : "캐릭터"} · {reasonLabel(r.reason)}
                </span>
                <span className={`text-xs ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleString("ko-KR", { hour12: false })}
                {r.resolvedAt && ` · 처리 ${new Date(r.resolvedAt).toLocaleString("ko-KR", { hour12: false })}`}
              </p>
              {r.detail && <p className="text-sm text-gray-700 mt-1">{r.detail}</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
