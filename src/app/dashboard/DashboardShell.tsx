"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  userEmail: string;
  creditBalance: number;
  isAdmin: boolean;
  emailVerified: boolean;
  children: React.ReactNode;
};

export default function DashboardShell({
  userEmail,
  creditBalance,
  isAdmin,
  emailVerified,
  children,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleResendVerification() {
    setResendLoading(true);
    await fetch("/api/auth/resend-verification", { method: "POST" });
    setResendLoading(false);
    setResendDone(true);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* 이메일 미인증 배너 */}
      {!emailVerified && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-700">
            이메일 인증이 완료되지 않았습니다. 인증 후 모든 기능을 이용하실 수 있습니다.
          </p>
          {resendDone ? (
            <span className="text-xs text-amber-600">발송 완료! 메일함을 확인해 주세요.</span>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {resendLoading ? "발송 중..." : "인증 메일 재발송"}
            </button>
          )}
        </div>
      )}

      {/* 헤더 */}
      <header className="border-b border-[#E8F0EB] bg-white sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          {/* 로고 */}
          <Link href="/dashboard" className="text-lg font-bold text-gray-900 shrink-0">
            MyToon
          </Link>

          {/* 네비 */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/dashboard" className="hover:text-gray-900 font-medium">
              내 서랍
            </Link>
            <Link href="/dashboard/characters" className="hover:text-gray-900">
              캐릭터
            </Link>
            <Link href="/examples" className="hover:text-gray-900">
              사용법
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-purple-600 hover:text-purple-800 font-medium">
                어드민
              </Link>
            )}
          </nav>

          {/* 우측 */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/new"
              className="rounded-full bg-[#7CAF8A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#6a9e79] whitespace-nowrap"
            >
              + 새 작품
            </Link>

            {/* 프로필 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F0EB] text-sm font-semibold text-[#7CAF8A] hover:bg-[#d5e8da]"
              >
                {userEmail.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 w-56 rounded-xl border border-[#E8F0EB] bg-white shadow-lg z-30">
                  {/* 사용자 정보 */}
                  <div className="px-4 py-3 border-b border-[#E8F0EB]">
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    {isAdmin ? (
                      <p className="text-xs font-semibold text-purple-600 mt-0.5">관리자</p>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        크레딧 <span className="text-[#7CAF8A]">{creditBalance}</span>개
                      </p>
                    )}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F0F7F2]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      설정
                    </Link>
                    {!isAdmin && (
                      <Link
                        href="/dashboard/credits"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F0F7F2]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        크레딧 충전
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      {children}
    </div>
  );
}
