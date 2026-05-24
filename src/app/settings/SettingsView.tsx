"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CreditTx = {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
};

type MyReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
};

type Props = {
  email: string;
  creditBalance: number;
  isAdmin: boolean;
  emailVerified: boolean;
  joinedAt: string;
  creditHistory: CreditTx[];
  myReports: MyReport[];
};

type Tab = "account" | "credits" | "reports";

const REASON_LABEL: Record<string, string> = {
  SIGNUP: "가입 보너스",
  PURCHASE: "충전",
  GENERATION: "생성",
  ADMIN: "관리자 지급",
  REFUND_GENERATION_FAILURE: "생성 실패 환불",
};

const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDING: "처리 중",
  RESOLVED_DELETED: "처리 완료 (삭제)",
  RESOLVED_DISMISSED: "처리 완료 (기각)",
  RESOLVED_HOLD: "처리 완료 (보류)",
};

export default function SettingsView({
  email,
  creditBalance,
  isAdmin,
  emailVerified,
  joinedAt,
  creditHistory,
  myReports,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const router = useRouter();

  // 비밀번호 변경
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (newPw !== confirmPw) {
      setPwError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setPwLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (!res.ok) {
      setPwError(data.error ?? "오류가 발생했습니다.");
      return;
    }
    setPwSuccess(true);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  }

  // 회원 탈퇴
  async function handleDeleteAccount() {
    const confirmed = confirm(
      "정말 탈퇴하시겠습니까?\n모든 데이터(프로젝트, 캐릭터 등)가 삭제되며 복구할 수 없습니다."
    );
    if (!confirmed) return;
    const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  }

  // 로그아웃
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* 페이지 헤더 */}
      <div className="border-b border-[#E8F0EB] bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-[#7CAF8A] hover:underline">
            ← 내 서랍
          </Link>
          <h1 className="text-lg font-bold text-gray-900">설정</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* 탭 */}
        <div className="flex border-b border-[#E8F0EB] mb-8">
          {(
            [
              { key: "account", label: "계정" },
              { key: "credits", label: "크레딧·결제" },
              { key: "reports", label: "신고·피드백" },
            ] as { key: Tab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#7CAF8A] text-[#7CAF8A]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 계정 탭 */}
        {activeTab === "account" && (
          <div className="space-y-8">
            {/* 이메일 표시 */}
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">이메일</h2>
              <div className="flex items-center gap-3">
                <p className="text-gray-900">{email}</p>
                {emailVerified ? (
                  <span className="rounded-full bg-[#E8F0EB] px-2 py-0.5 text-xs text-[#7CAF8A]">
                    인증 완료
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">
                    미인증
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                가입일: {new Date(joinedAt).toLocaleDateString("ko-KR")}
              </p>
            </div>

            {/* 비밀번호 변경 */}
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">비밀번호 변경</h2>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">현재 비밀번호</label>
                  <input
                    type="password"
                    required
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">새 비밀번호 (8자 이상)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">새 비밀번호 확인</label>
                  <input
                    type="password"
                    required
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7CAF8A]"
                  />
                </div>
                {pwError && <p className="text-sm text-red-500">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-[#7CAF8A]">비밀번호가 변경되었습니다.</p>}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="rounded-full bg-[#7CAF8A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6a9e79] disabled:opacity-50"
                >
                  {pwLoading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            </div>

            {/* 튜토리얼 */}
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">튜토리얼</h2>
              <p className="text-xs text-gray-400 mb-3">처음 사용 안내를 다시 볼 수 있습니다.</p>
              <button
                onClick={async () => {
                  await fetch("/api/auth/onboard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reset: true }),
                  });
                  window.location.href = "/dashboard";
                }}
                className="rounded-full border border-[#7CAF8A] px-5 py-2 text-sm font-medium text-[#7CAF8A] hover:bg-[#F0F7F2]"
              >
                튜토리얼 다시 보기
              </button>
            </div>

            {/* 회원 탈퇴 */}
            <div className="rounded-xl border border-red-100 bg-red-50 p-5">
              <h2 className="text-sm font-semibold text-red-700 mb-2">회원 탈퇴</h2>
              <p className="text-xs text-red-400 mb-3">
                탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-500 hover:bg-red-100"
              >
                탈퇴하기
              </button>
            </div>

            {/* 로그아웃 */}
            <div className="text-center">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-700 underline"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}

        {/* 크레딧·결제 탭 */}
        {activeTab === "credits" && (
          <div className="space-y-6">
            {/* 잔액 */}
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">현재 잔액</h2>
              <p className="text-3xl font-bold text-[#7CAF8A]">
                {isAdmin ? "∞" : creditBalance}
                <span className="text-base font-normal text-gray-400 ml-1">크레딧</span>
              </p>
            </div>

            {/* 베타 무료 안내 */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-800 mb-1">베타 기간 무료 운영 중</p>
              <p className="text-sm text-amber-700">
                현재 베타 기간 중으로 크레딧 충전 기능을 운영하지 않습니다.
                크레딧이 필요하시면{" "}
                <a href="mailto:edcrfv51@gmail.com" className="underline">
                  edcrfv51@gmail.com
                </a>
                으로 문의해 주세요.
              </p>
            </div>

            {/* 이력 */}
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">크레딧 이력</h2>
              {creditHistory.length === 0 ? (
                <p className="text-sm text-gray-400">이력이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {creditHistory.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-700">
                          {REASON_LABEL[tx.reason] ?? tx.reason}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <span
                        className={`font-semibold ${tx.delta > 0 ? "text-[#7CAF8A]" : "text-gray-500"}`}
                      >
                        {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 신고·피드백 탭 */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">내가 접수한 신고</h2>
              {myReports.length === 0 ? (
                <p className="text-sm text-gray-400">신고 내역이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {myReports.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-[#E8F0EB] p-3 flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm text-gray-700">
                          {r.targetType} · {r.reason}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.status === "PENDING"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-[#E8F0EB] text-[#7CAF8A]"
                        }`}
                      >
                        {REPORT_STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 피드백 링크 */}
            <div className="rounded-xl border border-[#E8F0EB] bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">피드백 보내기</h2>
              <p className="text-xs text-gray-400 mb-3">
                버그 신고, 기능 요청, 기타 문의는 이메일로 보내주세요.
              </p>
              <a
                href="mailto:edcrfv51@gmail.com?subject=MyToon 피드백"
                className="inline-block rounded-full border border-[#7CAF8A] px-5 py-2 text-sm font-medium text-[#7CAF8A] hover:bg-[#F0F7F2]"
              >
                피드백 보내기
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
