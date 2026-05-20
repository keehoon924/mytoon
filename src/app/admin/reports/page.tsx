"use client";

import { useEffect, useState } from "react";
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
  reporter: { id: string; email: string };
  resolvedBy: { id: string; email: string } | null;
};

const FILTERS = ["PENDING", "RESOLVED_DELETED", "RESOLVED_DISMISSED", "RESOLVED_HOLD", "ALL"] as const;

export default function AdminReportsPage() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>("PENDING");
  const [reports, setReports] = useState<Report[]>([]);
  const [tick, setTick] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/reports?status=${filter}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.reports) setReports(data.reports); });
    return () => { cancelled = true; };
  }, [filter, tick]);

  async function act(id: string, action: "delete" | "dismiss" | "hold") {
    if (action === "delete" && !confirm("대상을 삭제하시겠습니까?")) return;
    setBusyId(id); setError("");
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) { setError(data.error ?? "실패"); return; }
    setTick((t) => t + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">신고 큐</h1>
        <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded text-xs ${filter === f ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
              {f === "ALL" ? "전체" : statusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <div className="rounded-xl border bg-white divide-y">
        {reports.map((r) => (
          <div key={r.id} className="p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                {r.targetType === "PROJECT" ? "작품" : "캐릭터"} · {reasonLabel(r.reason)}
              </span>
              <span className={`text-xs ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
            </div>
            <div className="text-xs text-gray-500">
              신고자: {r.reporter.email} · {new Date(r.createdAt).toLocaleString("ko-KR", { hour12: false })}
            </div>
            <div className="text-xs text-gray-400">대상 ID: <code>{r.targetId}</code></div>
            {r.detail && <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.detail}</p>}
            {r.resolvedBy && (
              <div className="text-xs text-gray-400">처리: {r.resolvedBy.email} · {r.resolvedAt && new Date(r.resolvedAt).toLocaleString("ko-KR", { hour12: false })}</div>
            )}
            {r.status === "PENDING" && (
              <div className="flex gap-2 mt-2">
                <button disabled={busyId === r.id}
                  onClick={() => act(r.id, "delete")}
                  className="rounded-full bg-red-500 text-white text-xs px-3 py-1 disabled:opacity-50">
                  대상 삭제
                </button>
                <button disabled={busyId === r.id}
                  onClick={() => act(r.id, "hold")}
                  className="rounded-full border border-gray-200 text-xs px-3 py-1 disabled:opacity-50">
                  보류
                </button>
                <button disabled={busyId === r.id}
                  onClick={() => act(r.id, "dismiss")}
                  className="rounded-full border border-gray-200 text-xs text-gray-500 px-3 py-1 disabled:opacity-50">
                  기각
                </button>
              </div>
            )}
          </div>
        ))}
        {reports.length === 0 && (
          <p className="px-3 py-6 text-center text-gray-400 text-sm">신고가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
