export const REPORT_REASONS = [
  { id: "SPAM", label: "스팸·광고" },
  { id: "ADULT", label: "성인·선정" },
  { id: "VIOLENCE", label: "폭력·혐오" },
  { id: "COPYRIGHT", label: "저작권 침해" },
  { id: "OTHER", label: "기타" },
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number]["id"];
export type ReportTarget = "PROJECT" | "CHARACTER";

export function reasonLabel(id: ReportReasonId | string): string {
  return REPORT_REASONS.find((r) => r.id === id)?.label ?? id;
}

export function statusLabel(s: string): string {
  switch (s) {
    case "PENDING": return "대기";
    case "RESOLVED_DELETED": return "삭제 처리";
    case "RESOLVED_DISMISSED": return "기각";
    case "RESOLVED_HOLD": return "보류";
    default: return s;
  }
}

export function statusColor(s: string): string {
  switch (s) {
    case "PENDING": return "text-yellow-600";
    case "RESOLVED_DELETED": return "text-red-600";
    case "RESOLVED_DISMISSED": return "text-gray-500";
    case "RESOLVED_HOLD": return "text-blue-600";
    default: return "";
  }
}
