"use client";

import { useEffect, useState } from "react";

type User = {
  id: string; email: string; role: "USER" | "ADMIN";
  creditBalance: number; createdAt: string;
  _count: { projects: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [searchTick, setSearchTick] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deltaInput, setDeltaInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const url = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : "/api/admin/users";
    fetch(url).then((r) => r.json()).then((data) => {
      if (!cancelled && data.users) setUsers(data.users);
    });
    return () => { cancelled = true; };
  }, [searchTick, q]);

  async function applyDelta(userId: string) {
    const n = Number(deltaInput);
    if (!Number.isInteger(n) || n === 0) {
      setError("0이 아닌 정수를 입력하세요.");
      return;
    }
    setBusy(true); setError("");
    const res = await fetch(`/api/admin/users/${userId}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: n }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "실패"); return; }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, creditBalance: data.balance } : u));
    setEditingId(null);
    setDeltaInput("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">사용자</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); setSearchTick((t) => t + 1); }}
          className="flex gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이메일 검색"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button type="submit" className="rounded-lg bg-black px-3 py-1.5 text-sm text-white">검색</button>
        </form>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-3 py-2">이메일</th>
              <th className="px-3 py-2">역할</th>
              <th className="px-3 py-2 text-right">잔액</th>
              <th className="px-3 py-2 text-right">작품</th>
              <th className="px-3 py-2">가입일</th>
              <th className="px-3 py-2">크레딧 조정</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  {u.role === "ADMIN" ? <span className="text-purple-600 font-medium">ADMIN</span> : "USER"}
                </td>
                <td className="px-3 py-2 text-right">{u.creditBalance.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{u._count.projects}</td>
                <td className="px-3 py-2 text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-3 py-2">
                  {editingId === u.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={deltaInput}
                        onChange={(e) => setDeltaInput(e.target.value)}
                        placeholder="±크레딧"
                        className="w-20 rounded border border-gray-200 px-1 py-0.5 text-xs"
                      />
                      <button
                        disabled={busy}
                        onClick={() => applyDelta(u.id)}
                        className="rounded bg-black text-white text-xs px-2 py-0.5 disabled:opacity-50"
                      >적용</button>
                      <button
                        onClick={() => { setEditingId(null); setDeltaInput(""); }}
                        className="text-xs text-gray-400 hover:text-black"
                      >취소</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingId(u.id)}
                      className="text-xs text-blue-600 hover:underline">조정</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">결과 없음</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
