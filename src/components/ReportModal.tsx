"use client";

import { useState } from "react";
import { REPORT_REASONS, type ReportReasonId, type ReportTarget } from "@/lib/reports";

type Props = {
  open: boolean;
  onClose: () => void;
  targetType: ReportTarget;
  targetId: string;
  targetLabel?: string;
};

export default function ReportModal({ open, onClose, targetType, targetId, targetLabel }: Props) {
  const [reason, setReason] = useState<ReportReasonId>("SPAM");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function submit() {
    setBusy(true); setError("");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason, detail: detail.trim() || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "실패"); return; }
    setDone(true);
  }

  function close() {
    setReason("SPAM"); setDetail(""); setError(""); setDone(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">신고하기</h2>
        {targetLabel && <p className="text-sm text-gray-500 mb-3">대상: {targetLabel}</p>}

        {done ? (
          <>
            <p className="text-sm text-gray-700 mb-4">신고가 접수되었습니다. 관리자가 검토 후 처리합니다.</p>
            <div className="flex justify-end">
              <button onClick={close} className="rounded-full bg-black px-5 py-1.5 text-sm font-semibold text-white">닫기</button>
            </div>
          </>
        ) : (
          <>
            <label className="block text-xs text-gray-500 mb-1">사유</label>
            <select value={reason} onChange={(e) => setReason(e.target.value as ReportReasonId)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-black">
              {REPORT_REASONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>

            <label className="block text-xs text-gray-500 mb-1">상세 (선택)</label>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3}
              maxLength={500}
              placeholder="구체적인 사유를 입력해주세요."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-black" />

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex gap-2 justify-end">
              <button onClick={close} className="text-sm text-gray-500 hover:text-black">취소</button>
              <button disabled={busy} onClick={submit}
                className="rounded-full bg-black px-5 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? "전송 중..." : "신고 접수"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
