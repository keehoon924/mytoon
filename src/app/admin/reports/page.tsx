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

type Feedback = {
  id: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
  user: { email: string };
};

const REPORT_FILTERS = ["PENDING", "RESOLVED_DELETED", "RESOLVED_DISMISSED", "RESOLVED_HOLD", "ALL"] as const;
const FEEDBACK_CATEGORY_LABEL: Record<string, string> = {
  BUG: "버그 신고",
  REQUEST: "기능 요청",
  INQUIRY: "기타 문의",
};

export default function AdminReportsPage() {
  const [mainTab, setMainTab] = useState<"reports" | "feedback">("reports");

  // --- Reports ---
  const [filter, setFilter] = useState<typeof REPORT_FILTERS[number]>("PENDING");
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsTick, setReportsTick] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/reports?status=${filter}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.reports) setReports(data.reports); });
    return () => { cancelled = true; };
  }, [filter, reportsTick]);

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
    setReportsTick((t) => t + 1);
  }

  // --- Feedback ---
  const [fbFilter, setFbFilter] = useState<"OPEN" | "DONE" | "ALL">("OPEN");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [fbTick, setFbTick] = useState(0);
  const [fbBusyId, setFbBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const qs = fbFilter === "ALL" ? "" : `?status=${fbFilter}`;
    fetch(`/api/admin/feedback${qs}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.feedbacks) setFeedbacks(data.feedbacks); });
    return () => { cancelled = true; };
  }, [fbFilter, fbTick]);

  // Fetch open count for badge
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/feedback?status=OPEN")
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.feedbacks) setOpenCount(data.feedbacks.length); });
    return () => { cancelled = true; };
  }, [fbTick]);

  async function markFeedback(id: string, status: "OPEN" | "DONE") {
    setFbBusyId(id);
    await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setFbBusyId(null);
    setFbTick((t) => t + 1);
  }

  return (
    <div>
      {/* 메인 탭 */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setMainTab("reports")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            mainTab === "reports"
              ? "border-[#7CAF8A] text-[#7CAF8A]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          신고 큐
        </button>
        <button
          onClick={() => setMainTab("feedback")}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            mainTab === "feedback"
              ? "border-[#7CAF8A] text-[#7CAF8A]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          피드백
          {openCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {openCount > 99 ? "99+" : openCount}
            </span>
          )}
        </button>
      </div>

      {/* 신고 탭 */}
      {mainTab === "reports" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">신고 큐</h1>
            <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
              {REPORT_FILTERS.map((f) => (
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
      )}

      {/* 피드백 탭 */}
      {mainTab === "feedback" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">피드백 큐</h1>
            <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
              {(["OPEN", "DONE", "ALL"] as const).map((f) => (
                <button key={f} onClick={() => setFbFilter(f)}
                  className={`px-2 py-1 rounded text-xs ${fbFilter === f ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                  {f === "OPEN" ? "미처리" : f === "DONE" ? "처리 완료" : "전체"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white divide-y">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {FEEDBACK_CATEGORY_LABEL[fb.category] ?? fb.category}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      fb.status === "DONE"
                        ? "bg-[#E8F0EB] text-[#7CAF8A]"
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {fb.status === "DONE" ? "처리 완료" : "미처리"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(fb.createdAt).toLocaleString("ko-KR", { hour12: false })}
                  </span>
                </div>
                <div className="text-xs text-gray-500">{fb.user.email}</div>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{fb.message}</p>
                <div className="flex gap-2 mt-2">
                  {fb.status === "OPEN" ? (
                    <button
                      disabled={fbBusyId === fb.id}
                      onClick={() => markFeedback(fb.id, "DONE")}
                      className="rounded-full bg-[#7CAF8A] text-white text-xs px-3 py-1 disabled:opacity-50"
                    >
                      처리 완료
                    </button>
                  ) : (
                    <button
                      disabled={fbBusyId === fb.id}
                      onClick={() => markFeedback(fb.id, "OPEN")}
                      className="rounded-full border border-gray-200 text-xs px-3 py-1 disabled:opacity-50"
                    >
                      미처리로 변경
                    </button>
                  )}
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <p className="px-3 py-6 text-center text-gray-400 text-sm">피드백이 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
