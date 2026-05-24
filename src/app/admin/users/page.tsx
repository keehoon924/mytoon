"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  creditBalance: number;
  createdAt: string;
  lastActiveAt: string | null;
  emailVerifiedAt: string | null;
  _count: { projects: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [inputQ, setInputQ] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deltaInput, setDeltaInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const url = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : "/api/admin/users";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.users) setUsers(data.users);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [q]);

  async function applyDelta(userId: string) {
    const n = Number(deltaInput);
    if (!Number.isInteger(n) || n === 0) {
      setError("0이 아닌 정수를 입력하세요.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/users/${userId}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: n }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "실패");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, creditBalance: data.balance } : u))
    );
    setEditingId(null);
    setDeltaInput("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">사용자</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? "불러오는 중..." : `${users.length}명`}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQ(inputQ.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder="이메일 검색"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-48"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 text-white text-sm px-4 py-1.5 hover:bg-purple-700"
          >
            검색
          </button>
          {q && (
            <button
              type="button"
              onClick={() => { setQ(""); setInputQ(""); }}
              className="rounded-lg border border-gray-200 text-sm px-3 py-1.5 text-gray-500 hover:bg-gray-50"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">역할</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">크레딧</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">작품</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">가입일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">크레딧 조정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700 shrink-0">
                      {u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{u.email}</p>
                      {!u.emailVerifiedAt && (
                        <p className="text-xs text-amber-500">미인증</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.role === "ADMIN" ? (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">USER</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {u.creditBalance.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{u._count.projects}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  {editingId === u.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={deltaInput}
                        onChange={(e) => setDeltaInput(e.target.value)}
                        placeholder="±크레딧"
                        className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300"
                      />
                      <button
                        disabled={busy}
                        onClick={() => applyDelta(u.id)}
                        className="rounded-lg bg-purple-600 text-white text-xs px-2.5 py-1 disabled:opacity-50 hover:bg-purple-700"
                      >
                        적용
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setDeltaInput("");
                          setError("");
                        }}
                        className="text-xs text-gray-400 hover:text-gray-700"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(u.id)}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      조정
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                  {q ? `"${q}" 검색 결과가 없습니다.` : "사용자가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="px-4 py-8 text-center text-gray-400 text-sm">불러오는 중...</div>
        )}
      </div>
    </div>
  );
}
